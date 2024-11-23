document.addEventListener("DOMContentLoaded", function () {

    const signupSection = document.getElementById('signup-section');
    const loginSection = document.getElementById('login-section');
    const signupButton = document.querySelector('.sign-up button');
    const loginButton = document.querySelector('.login-btn');

    signupButton.addEventListener('click', function () {
        signupSection.style.display = 'none';
        loginSection.style.display = 'block'; 
    });

    loginButton.addEventListener('click', function () {
        loginSection.style.display = 'none';
        signupSection.style.display = 'block'; 
    });

});
