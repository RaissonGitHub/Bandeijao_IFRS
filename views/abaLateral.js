let header = document.getElementById('header');
let navegacao = document.getElementById('navegacao');
let conteudo = document.getElementById('conteudo');
let button = document.getElementsByClassName('drop-button');
let caixas = document.getElementsByClassName('drop-content');
let barrinha = false;

function mostrarbarrinha(){
    barrinha = !barrinha;
    if(barrinha){
        navegacao.style.left = '0';
        navegacao.style.animationName = 'barrinha';
}
else{
        navegacao.style.left = '-300px';
        navegacao.style.animationName = '';
    }
}
function fecharbarrinha(){
    if(barrinha){
        mostrarbarrinha();
    }
}

for(let i = 0; i<button.length;i++){
    button[i].addEventListener('click', function(){
        if(caixas[i].style.display === "block"){ //se a caixa estiver aberta
            caixas[i].style.display = "none";

        }
        else{//se a caixa estiver fechada
            caixas[i].style.display = "block";             
        }
    })
}



