document.addEventListener("DOMContentLoaded", () => {
    //Close all forms on load
    document.querySelectorAll(".form-popup").forEach(f => {
        f.style.display = "none";
    });
    //Handler Form buttons actions
    const formActions = {
        "game-form": {
            "remove-front": "/removeFront",
            "delete": "/game/delete",
            "front-page": "/addFront",
        },
        "editor-form": {
            "delete": "/editor/delete",
        },
    };
    document.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON" && event.target.type === "submit") {
            const buttonId = event.target.id;
            //https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
            const form = event.target.closest("form");
            if (form && formActions[form.className]) {
                form.action = formActions[form.className][buttonId];
            }
        }
    });

    try {
        Carousel();
    } catch (error) { }
});

//Creates a Carousel
//https://www.w3schools.com/howto/howto_js_slideshow.asp
function Carousel() {
    let slideIndex = 1;
    showSlides(slideIndex);
    window.plusSlides = function (n) {
        showSlides(slideIndex += n);
    };

    window.currentSlide = function (n) {
        showSlides(slideIndex = n);
    };

    function showSlides(n) {
        const slides = document.getElementsByClassName("game-item-slide");

        if (n > slides.length) slideIndex = 1;
        if (n < 1) slideIndex = slides.length;

        Array.from(slides).forEach(slide => slide.style.display = "none");
        slides[slideIndex - 1].style.display = "block";
    }
}

//Close Form if close is clicked or another form is opened
//https://www.w3schools.com/howto/howto_js_popup_form.asp
function openForm(formId) {
    const form = document.getElementById(formId);

    const forms = document.querySelectorAll(".form-popup");
    forms.forEach(f => {
        if (f.id !== formId) f.style.display = "none";
    });

    if (form.style.display === "block") {
        form.style.display = "none";
        openFormId = null;

    } else {
        form.style.display = "block";
        openFormId = formId;
    }
}

function closeForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.style.display = "none";
}