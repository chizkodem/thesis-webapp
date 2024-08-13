document.addEventListener("DOMContentLoaded", function () {
  var navLinks = document.querySelectorAll(".nav-link");
  var beforeElement = document.querySelector(".selected.active::before");

  navLinks.forEach(function (link, index) {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      document.querySelectorAll(".navbar li").forEach(function (li) {
        li.classList.remove("active");
      });

      this.closest("li").classList.add("active");
    });
  });

  // logoLink.addEventListener("click", function (event) {
  //   event.preventDefault();

  //   document.querySelectorAll(".navbar li").forEach(function (li) {
  //     li.classList.remove("active");
  //   });

  //   beforeElement.classList.remove("animate-slide-in");
  // });
});
