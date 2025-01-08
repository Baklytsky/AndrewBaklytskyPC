if (!customElements.get('product-estimate')) {
  class ProductEstimate extends HTMLElement {
    constructor() {
      super();
      
      this.excludeWeekends = true;
    }
    
    connectedCallback() {
      const dataElement = this.querySelector('[type="application/json"]');
      
      if (!dataElement || !dataElement.innerHTML) return;
      
      this.dataJSON = JSON.parse(dataElement.innerHTML);
      this.timeOfDay = this.dataJSON.warehouse_cutoff_time_of_day;
      this.cutOffTime = this.dataJSON.warehouse_cutoff_time;
      this.preorder = this.dataJSON.preorder;
      this.preorderDate = this.dataJSON.preorder_date;
      this.preorderPropertyPlaceholder = this.dataJSON.preorder_property_placeholder;
      
      if (sessionStorage.getItem("userUSState")) {
        this.setMessages();
      } else {
        this.getUserLocation()
          .then(() => this.setMessages())
          .catch(() => this.hidden = true);
      }
    }
  
    setMessages() {
      const shippingData = this.getShippingData();
      
      if (shippingData) {
        this.setDeliveryDate();
        this.setRemainingDate();
        this.setPreorderProperty();
        this.removeAttribute('hidden');
        this.setShippingEstimateCartAttribute();
      } else {
        this.hidden = true;
      }
    }
  
    setRemainingDate() {
      const formatDate = this.getRemainingDate();
      const hoursElement = this.querySelector('[data-hrs-left]');
      const minutesElement = this.querySelector('[data-mins-left]');
  
      if (hoursElement) hoursElement.innerHTML = `${formatDate.hours}`;
      if (minutesElement) minutesElement.innerHTML = `${formatDate.minutes}`;
    }
  
    setDeliveryDate() {
      const {weekName, monthName, day} = this.getDeliveryDate();
      
      const deliveryDateElement = this.querySelector('[data-delivery-date]');
      if (deliveryDateElement) deliveryDateElement.innerHTML = `${weekName}, ${monthName} ${day}`;
    }
  
    setPreorderProperty() {
      const productDeliveryParent = document.getElementById('product-delivery');
      if (!productDeliveryParent) return;
      const preorderProperty = productDeliveryParent.querySelector('input[name="properties[Preorder]"]');
      const {weekName, monthName, day} = this.getDeliveryDate();
    
      if (!preorderProperty || productDeliveryParent.hasAttribute('data-hide-delivery'))  return;
    
      preorderProperty.value = this.preorderPropertyPlaceholder.replace('{{ date }}', `${weekName}, ${monthName} ${day}`);
    }
  
    getRemainingDate() {
      const dayInMs = 1000 * 60 * 60 * 24;
      const currentDate = this.getDateByTimezone(this.dataJSON.warehouse_time_zone);
      const hoursToMs = currentDate.getHours() * 60 * 60 * 1000;
      const minToMs = currentDate.getMinutes() * 60 * 1000;
      const currentTotalMs = hoursToMs + minToMs;
      const secondHalf = dayInMs - currentTotalMs;
    
      if (!this.cutOffTime) return;
    
      let cutOffHours = parseInt(this.cutOffTime.split(':')[0]) || 0;
      let cutOffMinutesMs = parseInt(this.cutOffTime.split(':')[1]) * 60 * 1000;
      cutOffHours = (this.timeOfDay.toLowerCase() === 'pm') ? cutOffHours + 12 : cutOffHours;
      let cutOffHoursToMs = cutOffHours * 60 * 60 * 1000;
      const cutOffTotal = cutOffHoursToMs + cutOffMinutesMs;
    
      if (currentTotalMs > cutOffTotal) {
        return this.getFormatDate(cutOffTotal + secondHalf);
      } else {
        return this.getFormatDate(cutOffTotal - currentTotalMs);
      }
    }
  
    getDeliveryDate() {
      const shippingData = this.getShippingData();
      let shippingDays = parseInt(shippingData['Total Time Shown']);
      shippingDays = (shippingDays === 0) ? 0 : shippingDays - 1;  //-1 - On last day delivery
      const weekends = this.getWeekendDays(shippingDays);
      shippingDays = shippingDays + weekends + 1;

      if (this.preorder && this.preorderDate !== '') {
        let currentDate = this.getDateByTimezone(parseInt(this.dataJSON.warehouse_time_zone));
        let preorderDate = new Date(this.preorderDate);
    
        if (currentDate.getTime() < preorderDate.getTime()) {
          const preorderTimeDifference = Math.round((preorderDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
          shippingDays += preorderTimeDifference;
          
          if (preorderTimeDifference <= 3 && preorderTimeDifference >= 0) {
            shippingDays += 3;
            
            if (preorderDate.getDay() === 0) {
              shippingDays += 1;
            } else if (preorderDate.getDay() === 6) {
              shippingDays += 2;
            }
          }
        }
      }
      
      const estimatedDate = this.getEstimatedDate(shippingDays);
      const weekName = estimatedDate.toLocaleString('default', { weekday: 'long' });
      const monthName = estimatedDate.toLocaleString('default', { month: 'short' });
      const day = estimatedDate.getDate();
      
      return {weekName, monthName, day, estimatedDate};
    }
    
    /**
     * @property {number} shippingDaysToMs - calculated time in ms (milliseconds)
     * @property {object} estimatedDate - calculated time Object
     * @property {number} estimatedDay - get day
     * @property {boolean} isExclude - check if exclude list contains this date
     * @property {boolean} isCutOff - check if warehouse is closed for today
     * @return {object} estimatedDate - calculated date Object
     * */
    
    getEstimatedDate(days, cutOffValidation = true) {
      const sendingDate = this.getSendingDate();
      
      const shippingDaysToMs = 1000 * 60 * 60 * 24 * days;
      const estimatedDate = new Date(sendingDate.getTime() + shippingDaysToMs);
      const estimatedDay = estimatedDate.getDay();  //Day index 0 - 6 where 0 - sunday
      const isExclude = this.checkOnExclude(estimatedDate);
      const isCutOff = cutOffValidation ? this.isCutOff(estimatedDate) : cutOffValidation;
      
      if ((estimatedDay === 0 || estimatedDay === 6) && this.excludeWeekends || isExclude || isCutOff) {
        if (isCutOff) {
          return this.getEstimatedDate(days + 1, false);
        }
        
        return this.getEstimatedDate(days + 1, cutOffValidation);
      }
      
      return estimatedDate;
    }

    getWeekendDays(shippingDays) {
      const sendingDate = this.getSendingDate();
      let startDate = sendingDate;
      let weekends = 0;

      for (let i = 1; i <= shippingDays; i++) {
        startDate.setDate(sendingDate.getDate() + 1);
        const day = sendingDate.getDay();
        if (day === 0 || day === 6) weekends++;
      }

      return weekends;
    }
    
    getSendingDate() {
      let currentDate = this.getDateByTimezone(parseInt(this.dataJSON.warehouse_time_zone));
      const dayToMs = 1000 * 60 * 60 * 24;
      let isExclude = this.checkOnExclude(currentDate);
      let isCutOff = this.isCutOff(currentDate);
      
      while((currentDate.getDay() === 0 || currentDate.getDay() === 6) && this.excludeWeekends || isExclude || isCutOff) {
        if (isCutOff) {
          currentDate.setHours(0);
          currentDate.setMinutes(0);
          currentDate.setSeconds(0);
        }
  
        currentDate.setTime(currentDate.getTime() + dayToMs);
        
        isExclude = this.checkOnExclude(currentDate);
        isCutOff = this.isCutOff(currentDate);
      }
      
      return currentDate;
    }
  
    getShippingData() {
      if (!this.dataJSON.estimates || !sessionStorage.getItem("userUSState")) return false;
      
      const estimatesKeys = Object.keys(this.dataJSON.estimates);   //["Alabama", "New Jersey" ...]
      const matchState = estimatesKeys.find(state => state.toLowerCase() === sessionStorage.getItem("userUSState").toLowerCase());
      
      return this.dataJSON.estimates[matchState];
    }
  
    async getUserLocation() {
      let geocodingResult = null;

      try {
        const response = await fetch("https://api.geoapify.com/v1/ipinfo?&apiKey=beb7e73deaae4f688934e0b6b9a7a160")
        geocodingResult = await response.json()
      } catch (error) {
        if (error instanceof SyntaxError) {
          // Unexpected token < in JSON
          console.log('There was a SyntaxError', error);
        } else {
          console.log('There was an error', error);
        }
      }

      if (geocodingResult) {
        if (geocodingResult.statusCode >= 200 && geocodingResult.statusCode <= 299 || !geocodingResult.statusCode) {
          const userUSState = geocodingResult.state?.name;
          if (userUSState) sessionStorage.setItem('userUSState', userUSState);
        }
      }
    }
  
    getFormatDate(ms) {
      let milliseconds = Math.floor((ms % 1000) / 100),
          seconds = Math.floor((ms / 1000) % 60),
          minutes = Math.floor((ms / (1000 * 60)) % 60),
          hours = Math.floor((ms / (1000 * 60 * 60)) % 24),
          days = Math.floor(ms / (1000 * 60 * 60 * 24));
    
      hours = (hours < 10) ? parseInt("0" + hours) : hours;
      minutes = (minutes < 10) ? parseInt("0" + minutes) : minutes;
      seconds = (seconds < 10) ? parseInt("0" + seconds) : seconds;
    
      return {milliseconds, seconds, minutes, hours, days};
    }
  
    getDateByTimezone(timezone) {
      let dateInTimeZoneString = new Date( new Date().getTime() + timezone * 3600 * 1000).toUTCString();
      dateInTimeZoneString = dateInTimeZoneString.split(' ').slice(0, 5).join(' ');
      
      return new Date(dateInTimeZoneString);
    }
  
    /**
     * @return {boolean} true if date match with exclude list from metafields
     * */
    checkOnExclude(date = null) {
      const dayInMs = 1000 * 60 * 60 * 24 - 1;
      const excludeList = Object.keys(this.dataJSON.excludes);
      
      if (!excludeList) return;
      
      const currentDate = date || this.getDateByTimezone(this.dataJSON.warehouse_time_zone);
      
      const excludesMatch = excludeList.find(item => {
        const excludeBegin = new Date(item);
        const excludeEnd = new Date(item).getTime() + dayInMs;
        
        return currentDate.getTime() >= excludeBegin.getTime() && currentDate.getTime() <= excludeEnd;
      });
      
      return !!excludesMatch;
    }
    
    /**
     * @return {boolean} true if we are in range from 00:00 to this.cutOffTime
     * */
    isCutOff(date) {
      if (!this.cutOffTime) return;
  
      let cutOffHours = parseInt(this.cutOffTime.split(':')[0]);
      let cutOffMinutes = parseInt(this.cutOffTime.split(':')[1]);
      cutOffHours = (this.timeOfDay.toLowerCase() === 'pm') ? cutOffHours + 12 : cutOffHours;
      
      const cutOffDate = new Date(date.getTime());
      cutOffDate.setHours(cutOffHours);
      cutOffDate.setMinutes(cutOffMinutes);
      
      //If current date more than cutoff date - return true
      return date.getTime() > cutOffDate.getTime();
    }
  
    setShippingEstimateCartAttribute() {
      if (this.dataset.checkoutEstimate === 'false')  return;
      
      const cartItems = this.closest('cart-items');
      if (!cartItems) return;
      const cartForm = cartItems.querySelector('#cart');
      if (!cartForm)  return;
      const {estimatedDate} = this.getDeliveryDate();
      const timeDifference = estimatedDate.getTime() - new Date().getTime();
      const msToDays = Math.ceil(timeDifference / (1000*60*60*24));
      
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'attributes[shipping_estimate_days]';
      input.value = msToDays.toString();
      cartForm.appendChild(input);
    }
  }
  
  customElements.define('product-estimate', ProductEstimate);
}