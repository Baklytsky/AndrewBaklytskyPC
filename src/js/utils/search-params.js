const getSearchParamsFromForm = (form) => {
  const formData = new FormData(form);
  const params = new URLSearchParams(formData);
  const filtered = Array.from(params.entries()).filter(([, value]) => {
    return !!value;
  });

  return new URLSearchParams(filtered).toString();
};

const updateURL = (searchParams) => {
  if (searchParams.length > 0) {
    history.pushState(
      { searchParams },
      "",
      `${window.location.pathname}${searchParams && "?".concat(searchParams)}`
    );
  } else {
    history.pushState({ searchParams }, "", `${window.location.pathname}`);
  }
};

export { getSearchParamsFromForm, updateURL };
