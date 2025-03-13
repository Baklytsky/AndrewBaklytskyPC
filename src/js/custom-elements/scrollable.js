var elements = document.querySelectorAll(".ra-scrollable button");

elements.forEach((el) => {
  el.addEventListener("click", (event) => {
    let parent = event.currentTarget.parentNode;
    parent.classList.toggle("ra-scrollable--expanded");
  });
});
