const wrap = (toWrap, wrapperClass = '', wrapperOption) => {
  const wrapper = wrapperOption || document.createElement('div');
  wrapper.classList.add(wrapperClass);
  wrapper.setAttribute('data-scroll-lock-scrollable', '');
  toWrap.parentNode.insertBefore(wrapper, toWrap);
  return wrapper.appendChild(toWrap);
};

export default wrap;
