document.addEventListener("DOMContentLoaded", function () {
  var navLinks = document.querySelectorAll(".nav-link");
  var logoLink = document.querySelector(".logo");
  var beforeElement = document.querySelector(".selected.active::before");

  navLinks.forEach(function (link, index) {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      document.querySelectorAll(".navbar li").forEach(function (li) {
        li.classList.remove("active");
      });

      this.closest("li").classList.add("active");

      // var topPosition = index * beforeElement.clientHeight;
      // document.documentElement.style.setProperty(
      //   "--top-position",
      //   topPosition + "px"
      // );

      // Force a reflow to ensure the updated style is applied before the animation
      // void beforeElement.offsetWidth;

      // beforeElement.classList.add("animate-slide-in");
    });
  });

  logoLink.addEventListener("click", function (event) {
    event.preventDefault();

    document.querySelectorAll(".navbar li").forEach(function (li) {
      li.classList.remove("active");
    });

    beforeElement.classList.remove("animate-slide-in");
  });
});
