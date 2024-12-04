document.addEventListener("DOMContentLoaded", () => {
    try {
        Carousel();
    } catch (error) { }

    const games = new CheckboxList("checkbox-game-form");
    games.addListeners();

    const editors = new CheckboxList("checkbox-editors-form");
    editors.addListeners();
    document.querySelector('.button').addEventListener('click', () => {
        deleteSelection(games.checkedList);
    });   
});


let openFormId = null;

//https://www.w3schools.com/howto/howto_js_slideshow.asp
//Ajout d'un carousel des jeux mis en avant
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

//Popup Form afficher ou fermer (si on click à côté ou alors sur le boutton close)
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
//gestrion des clicks à côté du formulaire, si formulaire non clické, alors fermer le fomulaire
//https://stackoverflow.com/questions/22018136/how-do-i-detect-if-something-is-being-clicked-in-javascript-without-using-jque
function Click(event) {
    if (!openFormId) return;

    const openFormElement = document.getElementById(openFormId);

    if (!openFormElement.contains(event.target)) {
        openFormElement.style.display = "none";
        openFormId = null;
    }
}

//https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation
//Empêche le document de detecter les clicks sur les formulaires et les boutons (utile pour l'ouverture et la fermeture des formulaires)
document.querySelectorAll(".form-popup, .open-button").forEach(element => {
    element.addEventListener("click", event => event.stopPropagation());
});

class CheckboxList {
    constructor(className) {
        this.elements = Array.from(document.getElementsByClassName(className));
        this.checkedList = [];
    }
    addListeners() {
        this.elements.forEach(element => {
            element.addEventListener("change", () => {
                if (this.checkedList.includes(element.id)) {
                    this.checkedList = this.checkedList.filter(id => id !== element.id);
                } else {
                    this.checkedList.push(element.id);
                }
            });
        });
    }
}

function deleteSelection(games) {
    fetch('/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify( "checkedList", games ), // Encapsuler dans un objet
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Une erreur s\'est produite.');
    });
}


  