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
const Curso = require("./models/Curso")

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

//refeicao
app.get("/refeicao", (req, res) => {
	res.render("refeicao");
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
	if (buttonClicked === "Novo Pedido") {
		res.render("cardapio");
	} else if (buttonClicked === "Atualizar Pedido") {
	} else if (buttonClicked === "Excluir Pedido") {
	}
});

//Perfil
app.get("/perfil", (req, res) => {
	const u = new Usuario();
	u.listar(connection, function (result) {
		res.render("perfil", { usuario: result[0] });
	});
});

//cardapio
app.get("/cardapio", (req, res) => {
	const cardapOnivoro = new Cardapio();
	cardapOnivoro.listar(connection, new Date().getDay(), "onivoro");
	res.render("cardapio");
});

//usuarios
app.get("/usuarios", (req, res) => {
	res.render("usuarios");
});

app.post("/usuarios", (req, res) => {
	const buttonClicked = req.body.button;
	if (buttonClicked === "Novo Usuário") {
		res.render("cadastro");
	} else if (buttonClicked === "Atualizar Usuário") {
	} else if (buttonClicked === "Excluir Usuário") {
	}
});

//curso
app.get("/curso", (req, res) => {
	const c = new Curso;
	c.listar(connection,function(result) {
		res.render("cursos", {cursos:result});
	  });
});

app.post("/curso", (req, res) => {
	res.render("addcurso");
});

//addcurso
app.post("/addcurso", (req, res) => {
	const c = new Curso();
	c.nome = req.body.nome;
	c.tempo = req.body.tempo;
	c.modalidade = req.body.modalidade;
	c.cadastrar(connection);
	res.render("sucesso");
});



//addcardapio
app.get("/addcardapio", (req, res) => {
	res.render("addcardapio");
});
app.post("/addcardapio", (req, res) => {
	const c = new Cardapio();
	c.dia = req.body.dia
	c.descricao = req.body.descricao
	c.imagem = req.body.imagem;
	c.tipo = req.body.tipo;
	c.valor = req.body.valor
	c.inserir(connection)
	res.render("sucesso");
});


//attrestricoes
app.get("/attrestricoes", (req, res) => {
	res.render("restricoes");
});

//attsenha
app.get("/attsenha", (req, res) => {
	res.render("attsenha");
});

//attcadastro
app.get("/attcadastro", (req, res) => {
	res.render("attcadastro");
});

//pagcartao
app.get("/pagcartao", (req, res) => {
	res.render("pagcartao");
});

//feedback
app.get("/feedback", (req, res) => {
	res.render("feedback");
});

//refeicaoconfirm
app.get("/refeicaoconfirm", (req, res) => {
	res.render("refeicaoconfirm");
});
