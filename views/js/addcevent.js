const carnivoro = document.getElementsByClassName("cardapio-prato-carnivoro");
const vegetariano = document.getElementsByClassName("cardapio-prato-vegetariano");
const vegano = document.getElementsByClassName("cardapio-prato-vegano");
const carnivorob = document.querySelector("#carnivorob");
const vegetarianob = document.querySelector("#vegetarianob");
const veganob = document.querySelector("#veganob");
const opcao = document.querySelector("#opcao-escolhida-h2");



carnivorob.addEventListener("click", function () {
	opcao.innerHTML = "Onívoro";
    for(c of carnivoro){
        c.style.display = "flex";
    }
    for(v of vegetariano){
        v.style.display = "none";
    }
    for(veg of vegano){
        veg.style.display = "none";
    }
});
vegetarianob.addEventListener("click", function () {
	opcao.innerHTML = "Vegetariano";
	for(c of carnivoro){
        c.style.display = "none";
    }
    for(v of vegetariano){
        v.style.display = "flex";
    }
    for(veg of vegano){
        veg.style.display = "none";
    }
}); 
veganob.addEventListener("click", function () {
	opcao.innerHTML = "Vegano";
	for(c of carnivoro){
        c.style.display = "none";
    }
    for(v of vegetariano){
        v.style.display = "none";
    }
    for(veg of vegano){
        veg.style.display = "flex";
    }
});

