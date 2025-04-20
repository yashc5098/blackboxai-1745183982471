
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function(e) {
      e.preventDefault();
      document.getElementById("contactResponse").innerText = "Thank you! We'll get back to you soon.";
      contactForm.reset();
    });
  }

  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", function(e) {
      e.preventDefault();
      document.getElementById("bookingResponse").innerText = "Booking successful! We’ll email you the details.";
      bookingForm.reset();
    });
  }
});
