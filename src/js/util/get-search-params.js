function getSearchParams(searchForm, filtersForm, deleteParams = [], type = false) {
  const searchFormData = new FormData(searchForm);
  const searchFormParams = new URLSearchParams(searchFormData);

  if (!filtersForm) return searchFormParams.toString();

  const filtersFormData = new FormData(filtersForm);
  const filtersFormParams = new URLSearchParams(filtersFormData);

  // Get keys with empty values from the search-form and filters-form's FormData objects and delete them
  const emptyParams = [];
  for (const pair of searchFormData.entries()) {
    if (pair[1] === '') emptyParams.push(pair[0]);
  }
  for (const pair of filtersFormData.entries()) {
    if (pair[1] === '') emptyParams.push(pair[0]);
  }
  for (let index = 0; index < emptyParams.length; index++) {
    const param = emptyParams[index];
    if (searchFormParams.has(param)) searchFormParams.delete(param);
    if (filtersFormParams.has(param)) filtersFormParams.delete(param);
  }

  // Delete duplicated keys gotten from the filters FormData object
  for (const key of searchFormParams.keys()) {
    if (filtersFormParams.has(key)) filtersFormParams.delete(key);
  }

  // Delete keys from deleteParams array
  if (deleteParams.length > 0) {
    for (let index = 0; index < deleteParams.length; index++) {
      const param = deleteParams[index];
      if (searchFormParams.has(param)) searchFormParams.delete(param);
      if (filtersFormParams.has(param)) filtersFormParams.delete(param);
    }
  }

  // Replace type key if necessary
  if (type) {
    if (filtersFormParams.has('type')) filtersFormParams.delete('type');
    searchFormParams.set('type', type);
  }

  return `${searchFormParams.toString()}&${filtersFormParams.toString()}`;
}

export default getSearchParams;
