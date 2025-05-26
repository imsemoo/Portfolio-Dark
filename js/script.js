// When the document is ready
$(document).ready(function () {
  "use strict";

  // Function to handle navbar scroll behavior
  function handleScroll() {
    var scrollPosition = $(window).scrollTop();

    // Check if scroll position is greater than 80px
  /*  if (scrollPosition > 80) {
      $(".navbar").addClass("fixed");
    } else {
      $(".navbar").removeClass("fixed");
    }
  }*/

  // Call the handleScroll function on page load
  handleScroll();

  // Call the handleScroll function on scroll event
  $(window).on("scroll", function() {
    handleScroll();
  });

  // Navigation link click behavior
  $(".navbar-nav a").on("click", function(event) {
    event.preventDefault();
    $(".navbar-nav li").removeClass("active"); // Remove active class from all navigation items
    $(this).parent().addClass("active"); // Add active class to the parent li element

    var hash = this.hash;
    $("html, body").animate(
      {
        scrollTop: $(hash).offset().top,
      },
      1000,
      function() {
        window.location.hash = hash;
      }
    );
  });
}});

// JavaScript to handle project filtering
document.addEventListener("DOMContentLoaded", function () {
  const filterBtns = document.querySelectorAll("#filter-gallary .btn");
  const projects = document.querySelectorAll(".card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const category = this.getAttribute("data-category");

      // Hide all projects initially
      projects.forEach((project) => {
        project.style.display = "none";
      });

      // Show projects based on selected category
      if (category === "all") {
        projects.forEach((project) => {
          project.style.display = "block";
        });
      } else {
        const filteredProjects = document.querySelectorAll(
          `.card[data-category="${category}"]`
        );
        filteredProjects.forEach((project) => {
          project.style.display = "block";
        });
      }

      // Update active button state
      filterBtns.forEach((btn) => {
        btn.classList.remove("active");
      });
      this.classList.add("active");
    });
  });
});

// Toggle menu icon animation
const menuIcon = document.getElementById("menu-icon");
const menuNav = document.getElementById("navbarNav");

menuNav.addEventListener("shown.bs.collapse", function () {
  menuIcon.classList.remove("fa-bars");
  menuIcon.classList.add("fa-times");
});

menuNav.addEventListener("hidden.bs.collapse", function () {
  menuIcon.classList.remove("fa-times");
  menuIcon.classList.add("fa-bars");
});

// Trigger fade-in animation for skills section
document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".skills").classList.add("fade-in");
});

// For Demo only: Add hover class to navigation items sequentially
var links = document.getElementsByClassName("nav-item");
for (var i = 0; i < links.length; i++) {
  addClass(i);
}

function addClass(id) {
  setTimeout(function () {
    if (id > 0) links[id - 1].classList.remove("hover");
    links[id].classList.add("hover");
  }, id * 750);
}
