// Codigo para o funcionamento das boxes na pagina index
let button = document.getElementsByClassName('drop-button');
let caixas = document.getElementsByClassName('drop-content');

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





