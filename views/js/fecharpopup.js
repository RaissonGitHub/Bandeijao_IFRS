const fechar = document.querySelector('.fundo')
const hamburguer = document.querySelector('.cellbutton')
const nav = document.querySelector('nav')
const x = document.querySelector('.fechar-nav')
hamburguer.addEventListener('click',function abrirNavbar(){
    nav.style.display = 'block';
    x.style.display = 'flex';
})
function fecharNavbar(){
    nav.style.display = 'none';
    x.style.display = 'none';
}
function fecharPopup() {
    fechar.style.display = 'none';
}
