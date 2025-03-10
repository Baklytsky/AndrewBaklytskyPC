
const _canSkipToStart = (start) => {
  return start > 1;
};

const _canSkipToEnd = (end, total) => {
  return end < total;
};

const _hasDistantStart = (start, threshold = 2) => {
  return start > threshold;
};

const _hasDistantEnd = (end, total, threshold = 1) => {
  return end < (total - threshold);
};

export const getPrev = (current, start) => {
  return current <= start ? null : current - 1;
};

export const getNext = (current, end) => {
  return current >= end ? null : current + 1;
};

export const getPageList = (total = 0) => {
  return Array.from(Array(total), (_, i) => i + 1);
};

export const getVisiblePageList = (list, current = 1, total, visible = 5) => {
  if (total <= visible) {
    return list;
  } else if (current < visible - Math.floor(visible / 2) + 1) {
    return list.slice(0, visible);
  } else if (total - current < visible - Math.ceil(visible / 2) + 1) {
    return list.slice(total - visible);
  }

  return list.slice(
    current - Math.ceil(visible / 2),
    current + Math.floor(visible / 2)
  );
};

export const getPagination = (current, total, visible) => {
  const pagination = {
    list: getPageList(total),
  };

  pagination.start = pagination.list[0];
  pagination.end = pagination.list[pagination.list.length - 1];

  pagination.visibleList = getVisiblePageList(pagination.list, current, total, visible);
  pagination.visibleStart = pagination.visibleList[0];
  pagination.visibleEnd = pagination.visibleList[pagination.visibleList.length - 1];

  pagination.prev = getPrev(current, pagination.visibleStart);
  pagination.next = getNext(current, pagination.visibleEnd);

  pagination.skipToStart = _canSkipToStart(pagination.visibleStart);
  pagination.skipToEnd = _canSkipToEnd(pagination.visibleEnd, total);

  pagination.hasDistantStart = _hasDistantStart(pagination.visibleStart);
  pagination.hasDistantEnd = _hasDistantEnd(pagination.visibleEnd, total);

  return pagination;
};
