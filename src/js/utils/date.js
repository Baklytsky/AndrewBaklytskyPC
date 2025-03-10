const convertDate = (date) => {
  let newDate = new Date(date);
  return `${
    newDate.getMonth() + 1
  }/${newDate.getDate()}/${newDate.getFullYear()}`;
};

export { convertDate };
