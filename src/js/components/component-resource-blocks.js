class Resources extends HTMLElement {
  constructor() {
    super();
    this.resourseBlocks = this.querySelectorAll('[data-resource-block]')
    const allTypes = Array.from(this.resourseBlocks).map(block => block.dataset.resourceBlock)
    this.resourseTypes = [...new Set(allTypes)]
    this.init()
  }

  init() {
    if (!customer) return
    this.setUrl();
  }
  async getRewardsToken() {
    const response = await fetch(`https://obagi-api.westus.cloudapp.azure.com/api/premier-points/token?id=${customer.id}`)
    const data = await response.json();
    return data?.token
  }

  setUrl() {
    this.resourseTypes.forEach(type => {
      const links = this.querySelectorAll(`[data-resource-block=${type}] a[href]`)

      switch (type) {
        case 'rewards':
          this.getRewardsToken().then((token) => {
            let url = token
              ? `https://practice.obagi.com/sso-login?token=${token}`
              : `https://practice.obagi.com/`;
            links.forEach(link => link.setAttribute('href', url));
          });
          break;
      }
    })

  }
}

customElements.define('resource-blocks', Resources);
