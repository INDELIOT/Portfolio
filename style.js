(function () {
    [...document.querySelectorAll(".control")].forEach(button => {
        button.addEventListener("click", function() {
            document.querySelector(".active-btn").classList.remove("active-btn");
            this.classList.add("active-btn");
            document.querySelector(".active").classList.remove("active");
            document.getElementById(button.dataset.id).classList.add("active");
        })
    });
    document.querySelector(".theme-btn").addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
    })
})();
emailjs.init("7iM2CD6LQ15JRMXgL"); // Replace with your EmailJS User ID

const sendBtn = document.querySelector('.send-btn');
const result = document.querySelector('.result');

sendBtn.addEventListener('click', sendEmail);

function sendEmail() {
    // Get the form data
    const to = document.getElementById("to").value;
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value;
    

    // Send the email using EmailJS
    emailjs.send("service_5j8whd9", "template_xumi78e", {
        
        to_email: to,
        subject: subject,
        message: message
    })
        .then(function () {
            result.innerHTML = "Masseage sent successfully!";
            result.style.opacity = 1;
        }, function (error) {
            result.innerHTML = "Masseage sending failed!";
            result.style.opacity = 1;
        });
}