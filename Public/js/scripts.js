document.addEventListener("DOMContentLoaded", () => {
    // Select necessary elements
    const formsContainer = document.querySelector(".forms");
    const loginForm = document.querySelector(".form.login");
    const signupForm = document.querySelector(".form.signup");
    const signupLink = document.querySelector(".signup-link");
    const loginLink = document.querySelector(".login-link");
    const pwShowHide = document.querySelectorAll(".eye-icon");
  
    // Toggle between Login and Signup forms
    signupLink.addEventListener("click", (e) => {
      e.preventDefault();
      formsContainer.classList.add("show-signup");
      loginForm.style.display = "none"; // Hide login form
      signupForm.style.display = "block"; // Show signup form
    });
  
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      formsContainer.classList.remove("show-signup");
      signupForm.style.display = "none"; // Hide signup form
      loginForm.style.display = "block"; // Show login form
    });
  
    // Show/hide password functionality
    pwShowHide.forEach((eyeIcon) => {
      eyeIcon.addEventListener("click", () => {
        const pwField = eyeIcon.previousElementSibling;
        if (pwField.type === "password") {
          pwField.type = "text";
          eyeIcon.classList.replace("bx-hide", "bx-show");
        } else {
          pwField.type = "password";
          eyeIcon.classList.replace("bx-show", "bx-hide");
        }
      });
    });
  });
  