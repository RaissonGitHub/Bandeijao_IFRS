const express = require('express');
const app = express();

app.use(express.static(__dirname + '/views'));

app.listen(3000, function(){
console.log("Servidor no ar - Porta 3000!")
});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', function(req, res){
res.sendFile(__dirname + '/views/home.html')
});

app.get('/pagcadastro', function(req, res){
res.sendFile(__dirname + '/views/cadastro.html')
}); 

app.post('/cadform', function(req, res){
    const buttonClicked = req.body.button;

    if (buttonClicked === 'Inserir') {
        // Lógica para o Botão 1
        res.sendFile(__dirname + '/views/pformulario.html')

      } 
    else if (buttonClicked === 'Atualizar') {

        // Lógica para o Botão 2
      } 
      else if (buttonClicked === 'Excluir') {

        // Lógica para o Botão 3
      } 
}); 

app.post('/formulario', function(req,res){
    const buttonClicked = req.body.button;

    if (buttonClicked === 'Enviar') {
        res.sendFile(__dirname+'/views/conclusaocad.html')

      } 
    else if (buttonClicked === 'Cancelar') {
        res.sendFile(__dirname+'/views/cadastro.html')
      } 
})
