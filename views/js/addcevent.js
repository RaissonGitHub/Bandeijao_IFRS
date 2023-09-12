const carnivoro = document.querySelector(".cardapio-prato-carnivoro")
const vegetariano = document.querySelector(".cardapio-prato-vegetariano")
const vegano = document.querySelector(".cardapio-prato-vegano")
const carnivorob = document.querySelector("#carnivorob")
const vegetarianob = document.querySelector("#vegetarianob")
const veganob = document.querySelector("#veganob")
const opcao = document.querySelector("#opcao-escolhida-h2")

carnivorob.addEventListener("click", function(){
    opcao.innerHTML = "Onívoro"
    carnivoro.style.display = "flex";
    vegetariano.style.display = "none";
    vegano.style.display = "none";
})
vegetarianob.addEventListener("click", function(){
    opcao.innerHTML = "Vegetariano"
    carnivoro.style.display = "none";
    vegetariano.style.display = "flex";
    vegano.style.display = "none";
})
veganob.addEventListener("click", function(){
    opcao.innerHTML = "Vegano"
    carnivoro.style.display = "none";
    vegetariano.style.display = "none";
    vegano.style.display = "flex";
})
