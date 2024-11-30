document.addEventListener("DOMContentLoaded", () => {
    //https://www.w3schools.com/howto/howto_js_slideshow.asp
    //Carousel de jeux
    let slideIndex = 1;
    showSlides(slideIndex);

    window.plusSlides = function (n) {
        showSlides(slideIndex += n);
    };

    window.currentSlide = function (n) {
        showSlides(slideIndex = n);
    };

    function showSlides(n) {
        let i;
        const slides = document.getElementsByClassName("game-item-slide");

        if (n > slides.length) {
            slideIndex = 1;
        }
        if (n < 1) {
            slideIndex = slides.length;
        }

        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }

        slides[slideIndex - 1].style.display = "block";
    }
});
