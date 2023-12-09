let fechado = true
const fechar = document.querySelector('.fundo')
const hamburguer = document.querySelector('.cellbutton')
const nav = document.querySelector('nav')
const x = document.querySelector('.fechar-nav')
hamburguer.addEventListener('click',function abrirNavbar(){
    if(fechado){
        fechado = false
        nav.style.display = 'block';
        x.style.display = 'flex';

    }else{
        fechado = true
        nav.style.display = 'none';
        x.style.display = 'none';
    }

})
function fecharNavbar(){
    nav.style.display = 'none';
    x.style.display = 'none';
}
function fecharPopup() {
    fechar.style.display = 'none';
}
