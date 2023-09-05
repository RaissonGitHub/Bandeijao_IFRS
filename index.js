//Imports dos modulos
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const mysql_config = require("./mysqlconfig");
const cors = require("cors");
const app = express();

const Pedido = require("./models/Pedido");
const Usuario = require("./models/Usuario");
const Cardapio = require("./models/Cardapio");

const connection = mysql.createConnection(mysql_config);
connection.connect((err) => {
	if (err) {
		console.log(err);
	} else {
		console.log("Banco de dados conectado!");
	}
});

//Configuracao dos modulos
app.use(express.static(__dirname + "/views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cors());

//Servidor listen
app.listen(3000, function () {
	console.log("Servidor no ar - Porta 3000!");
});

//Rotas

//login
app.get("/login", function (req, res) {
	res.render("login");
});

//Index
app.get("/", function (req, res) {
	res.render("index");
});

//Cadastro
app.get("/cadastro", function (req, res) {
	res.render("cadastro");
});

//Cadastro post
app.post("/cadastro", function (req, res) {
	const buttonClicked = req.body.button;
	const u = new Usuario();

	u.nome = req.body.nome;
	u.sobrenome = req.body.sobrenome;
	u.matricula = req.body.matricula;
	u.cpf = req.body.cpf;
	u.telefone = req.body.telefone;
	u.email = req.body.email;
	u.caracAlimenticia = req.body.escolha;
	u.senha = req.body.senha;
	u.curso.nome = req.body.curso;
  
	if (buttonClicked === "Enviar") {
    u.cadastrar(connection);
		res.render("sucesso");
	} else if (buttonClicked === "Cancelar") {
		res.sendFile(__dirname + "/views/cadastro.html");
	}
});

//Pedidos
app.get("/pedidos", function (req, res) {
  const p = new Pedido();
	p.listar(connection, function (result) {
    res.render("pedidos", { pedido: result });
	});
});

//Pedidos post
app.post("/pedidos", function (req, res) {
  const buttonClicked = req.body.button;
  
	if (buttonClicked === "Inserir") {
    // Lógica para o Botão 1
		res.sendFile(__dirname + "/views/pformulario.html");
	} else if (buttonClicked === "Atualizar") {
    // Lógica para o Botão 2
	} else if (buttonClicked === "Excluir") {
    // Lógica para o Botão 3
	}
});
//Perfil
app.get("/perfil", (req, res) => {
  const u = new Usuario();
	u.listar(connection, function (result) {
    res.render("perfil", { usuario: result[0] });
	});
});


app.get("/cardapio", (req, res) => {
  const cardapOnivoro = new Cardapio();
  cardapOnivoro.listar(connection,new Date().getDay())
  res.render("cardapio");
});











app.get("/attrestricoes", (req, res) => {
	res.render("restricoes");
});
app.get("/attsenha", (req, res) => {
	res.render("attsenha");
});
app.get("/attcadastro", (req, res) => {
	res.render("attcadastro");
});
app.get("/refeicao", (req, res) => {
	res.render("refeicao");
});
app.get("/pagcartao", (req, res) => {
	res.render("pagcartao");
});
app.get("/feedback", (req, res) => {
	res.render("feedback");
});
app.get("/refeicaoconfirm", (req, res) => {
	res.render("refeicaoconfirm");
});
