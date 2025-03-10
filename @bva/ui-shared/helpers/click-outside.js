
/**
 * Take an `exception` which can be either a Query Selector or a DOM Node reference,
 * and confirm whether or not said exception element is an ancestor of the `target` element.
 */
const _matchesException = (target, exception) => {
  if (typeof exception === 'string') {
    return !!target.closest(exception);
  } else if (exception instanceof HTMLElement) {
    return exception.contains(target);
  }

  return false;
};

export const getIsOutsideClick = (evt, el, options = {}) => {
  if (!el?.contains(evt.target) && !_matchesException(evt.target, options.except)) {
    evt.stopPropagation();

    return true;
  }

  return false;
};

export const bindClickOutside = (handler) => {
  document.addEventListener('mousedown', handler);
  document.addEventListener('touchstart', handler);
};

export const unbindClickOutside = (handler) => {
  document.removeEventListener('mousedown', handler);
  document.removeEventListener('touchstart', handler);
};
