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
const Curso = require("./models/Curso");
const Alimento = require("./models/Alimento");
const RestricaoAlimentar = require("./models/RestricaoAlimentar");

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

const session = require("express-session");

app.use(session({ secret: "seu_segredo_de_sessao", resave: false, saveUninitialized: true }));

//Servidor listen
app.listen(3000, function () {
	console.log("Servidor no ar - Porta 3000!");
});

//Rotas

//login
app.get("/login", function (req, res) {
	if (req.session.login) {
		res.render("index");
	} else {
		res.render("login");
	}
});
app.post("/login", function (req, res) {
	const u = new Usuario();
	u.cpf = req.body.cpf;
	u.senha = req.body.senha;

	u.verificarCredenciais(connection, u.cpf, u.senha, (error, user) => {
		if (error) {
			return res.render("login");
		}

		req.session.login = user.cpf;
		res.render("index");
	});
});
//Perfil
app.get("/perfil", (req, res) => {
	if (req.session.login) {
		const u = new Usuario();
		u.cpf = req.session.login;
		u.listarCredenciais(connection, function (result) {
			res.render("perfil", { usuario: result[0] }, console.log(result[0]));
		});
	} else {
		res.redirect("/login");
	}
});

//Index
app.get("/", function (req, res) {
	res.render("index");
});

//Cadastro
app.get("/cadastro", function (req, res) {
	const c = new Curso();
	c.listar(connection, function (result) {
		res.render("cadastro", { cursos: result });
	});
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
		res.render("sucesso",{mensagem:"Cadastro concluido com sucesso!",link:"/perfil"});
	} else if (buttonClicked === "Cancelar") {
		res.sendFile(__dirname + "/views/cadastro.html");
	}
});

//usuarios
app.get("/usuarios", (req, res) => {
	const u = new Usuario();
	u.listar(connection, function (result) {
		res.render("usuarios", { usuario: result });
	});
});

app.post("/usuarios", (req, res) => {
	const buttonClicked = req.body.button;
	if (buttonClicked === "Novo Usuário") {
		const c = new Curso();
		c.listar(connection, function (result) {
			res.render("cadastro", { cursos: result });
		});
	} else if (buttonClicked === "Atualizar Usuário") {
	} else if (buttonClicked === "Excluir Usuário") {
	}
});

//curso
app.get("/curso", (req, res) => {
	const c = new Curso();
	c.listar(connection, function (result) {
		res.render("cursos", { cursos: result });
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
	res.render("sucesso",{mensagem:"Cadastro de curso com sucesso!",link:"/curso"});
});

//cardapio
app.get("/cardapio", (req, res) => {
	const cardapio = new Cardapio();
	cardapio.listar(connection, function (result) {
		res.render("cardapio", { cardapios: result });
	});
});

//listacardapio
app.post("/listacardapio", (req, res) => {
	const c = new Cardapio();
	c.id = req.body.checkbox;
	id = c.id;
	const buttonClicked = req.body.button;
	if (buttonClicked === "Novo Cardapio") {
		res.render("addcardapio");
	} else if (buttonClicked === "Atualizar Cardapio") {
	} else if (buttonClicked === "Adicionar Alimento") {
		//se um cardapio for marcado
		if (c.id) {
			const a = new Alimento();
			a.listar(connection, function (result) {
				res.render("vincalimento", { c: c, alimento: result });
			});
		}
		//se nao foi
		else {
			console.log("selecione um cardapio");
		}
	} else if (buttonClicked === "Excluir Cardapio") {
	}
});

app.get("/listacardapio", (req, res) => {
	const c = new Cardapio();

	c.lista2(connection, function (result) {
		const cardapios = {};

		// Organiza os resultados em um objeto onde cada cardápio tem uma lista de alimentos associados
		result.forEach((row) => {
			const cardapioId = row.id_cardapio;
			if (!cardapios[cardapioId]) {
				cardapios[cardapioId] = new Cardapio();
				(cardapios[cardapioId].id_cardapio = cardapioId),
					(cardapios[cardapioId].dia = row.dia),
					(cardapios[cardapioId].tipo = row.tipo),
					(cardapios[cardapioId].imagem = row.imagem),
					(cardapios[cardapioId].descricao = row.descricao),
					(cardapios[cardapioId].valor = row.valor),
					(cardapios[cardapioId].alimentos = []);
			}

			if (row.id_alimento) {
				const a = new Alimento();
				(a.nome = row.nome_alimento),
					(a.unidade = row.unidade),
					(a.valorNutricional = row.valor_nutricional),
					cardapios[cardapioId].alimentos.push(a);
			}
		});

		res.render("listacardapio", { cardapios: cardapios });
	});
});

//addcardapio
app.get("/addcardapio", (req, res) => {
	res.render("addcardapio");
});
app.post("/addcardapio", (req, res) => {
	const c = new Cardapio();
	c.dia = req.body.dia;
	c.descricao = req.body.descricao;
	c.imagem = req.body.imagem;
	c.tipo = req.body.tipo;
	c.valor = req.body.valor;
	c.inserir(connection);
	res.render("sucesso",{mensagem:"Cadastro de cardapio concluido com sucesso!",link:"/listacardapio"});
});

//vincalimento
app.post("/vincalimentos", (req, res) => {
	const buttonClicked = req.body.button;
	const c = new Cardapio();
	c.id = id;
	c.idalimento = req.body.checkbox;
	if (buttonClicked === "Adicionar Alimento") {
		for (let a of c.idalimento) {
			c.inserirAlimentoNoCardapio(connection, a);
		}
		res.render("sucesso",{mensagem:"Alimento vinculado com sucesso!",link:"/listacardapio"});
	} else if (buttonClicked === "Desvincular Alimento") {
	}
});

let id = "";

//refeicao
app.get("/refeicao/:id", (req, res) => {
	const c = new Cardapio();
	id = req.params.id;
	c.listaEspecifica(connection, id, function (result) {
		c.dia = result[0].dia;
		c.tipo = result[0].tipo;
		c.descricao = result[0].descricao;
		c.valor = result[0].valor;
		c.alimentos = [];
		result.forEach((row) => {
			if (c.alimentos.indexOf(row) == -1) {
				const a = new Alimento();
				(a.nome = row.nome_alimento), (a.unidade = row.unidade), (a.valorNutricional = row.valor_nutricional), c.alimentos.push(a);
			}
		});
		res.render("refeicao", { cardapio: c });
	});
});

//refeicaoconfirm
app.post("/refeicaoconfirm", (req, res) => {
	const c = new Cardapio();
	c.listaEspecifica(connection, id, function (result) {
		c.dia = result[0].dia;
		c.tipo = result[0].tipo;
		c.descricao = result[0].descricao;
		c.valor = result[0].valor;
		c.alimentos = [];
		result.forEach((row) => {
			if (c.alimentos.indexOf(row) == -1) {
				const a = new Alimento();
				(a.nome = row.nome_alimento), (a.unidade = row.unidade), (a.valorNutricional = row.valor_nutricional), c.alimentos.push(a);
			}
		});
		res.render("refeicaoconfirm", { cardapio: c });
	});
});

//Pedidos
app.get("/pedidos", function (req, res) {
	if (req.session.login) {
		const p = new Pedido();
		p.usuario.cpf = req.session.login;
		p.listar(connection, function (result) {
			res.render("pedidos", { pedido: result });
		});
	} else {
		res.redirect("/login");
	}
});

//Pedidos post
app.post("/pedidos", function (req, res) {
	if (req.session.login) {
		const buttonClicked = req.body.button;
		if (buttonClicked === "Novo Pedido") {
			const cardapio = new Cardapio();
			cardapio.listar(connection, function (result) {
				res.render("cardapio", { cardapios: result });
			});
		} else if (buttonClicked === "Atualizar Pedido") {
			const p = new Pedido();
			pedidoId = req.body.checkbox;
			p.usuario.cpf = req.session.login;
			p.listarPedido(connection, pedidoId, function (result) {
				if (result[0].pagamento === "pago") {
					console.log("Pedidos pagos não podem ser editados");
				} else {
					res.render(`pagcartao`);
				}
			});
		} else if (buttonClicked === "Excluir Pedido") {
		}
	} else {
		res.redirect("/login");
	}
});

//listapedido
app.get("/listapedido", function (req, res) {
	const p = new Pedido();
	p.listarTodos(connection, function (result) {
		res.render("listapedidos", { pedido: result });
	});
});
app.post("/listapedido", function (req, res) {
	if (req.session.login) {
		const buttonClicked = req.body.button;
		if (buttonClicked === "Novo Pedido") {
			const cardapio = new Cardapio();
			cardapio.listar(connection, function (result) {
				res.render("cardapio", { cardapios: result });
			});
		} else if (buttonClicked === "Atualizar Pedido") {
		} else if (buttonClicked === "Excluir Pedido") {
		}
	} else {
		res.redirect("/login");
	}
});

let pedidoId = "";

//realizarpedido
app.post("/realizarpedido", function (req, res) {
	if (req.session.login) {
		const p = new Pedido();
		p.pagamento = "pendente";
		p.observacao = req.body.observacao;
		p.usuario.cpf = req.session.login;
		p.usuario.listarCredenciais(connection, function (result) {
			p.usuario.curso.nome = result[0].curso_id_curso;
			p.fazerPedido(connection, id, function (novoID) {
				pedidoId = novoID;
				res.render("pagcartao", { pedidoId: novoID });
			});
		});
	} else {
		res.redirect("/login");
	}
});

//pagcartao
app.post("/pagcartao", (req, res) => {
	if (req.session.login) {
		if (req.body.cartaonumero && req.body.cartaonome && req.body.cartaovalidade && req.body.cartaocvv) {
			const p = new Pedido();
			p.pagarPedido(connection, pedidoId);
			p.usuario.cpf = req.session.login;
			p.listar(connection, function (result) {
				res.render("pedidos", { pedido: result });
			});
		}
	} else {
		res.redirect("/login");
	}
});

//alimentos
app.get("/alimentos", (req, res) => {
	const a = new Alimento();
	a.listar(connection, function (result) {
		res.render("alimentos", { alimento: result });
	});
});
app.post("/alimentos", (req, res) => {
	const buttonClicked = req.body.button;
	if (buttonClicked === "Novo Alimento") {
		res.render("addalimento");
	} else if (buttonClicked === "Atualizar Alimento") {
	} else if (buttonClicked === "Excluir Alimento") {
	}
});

//addalimento
app.get("/addalimento", (req, res) => {
	res.render("addalimento");
});
app.post("/addalimento", (req, res) => {
	const a = new Alimento();
	a.nome = req.body.nome;
	a.unidade = req.body.unidade;
	a.valorNutricional = req.body.valornutri;
	a.cadastrar(connection);
	res.render("sucesso",{mensagem:"Alimento cadastrado com sucesso!",link:"/alimento"});
});


//restricao
app.get("/restricao", (req, res) => {
	if (req.session.login) {
		const u = new Usuario();
		u.restricao.listarEspecifica(connection, req.session.login, function (result) {
			u.restricoes = result;
			u.restricao.listar(connection, function (result) {
				res.render(
					"restricoes",
					{ restricoes: u.restricoes, lista: result },

				);
			});
		});
	} else {
		res.redirect("/login");
	}
});

app.post("/restricao", function (req, res) {
	const u = new Usuario();
	u.cpf = req.session.login
	u.listarCredenciais(connection,function(result){
		u.curso.id = result[0].curso_id_curso
		u.restricao.nome = req.body.addrestricao;
		u.restricao.listar(connection, function (result) {
			const encontrou = result.find((item) => item.nome_restricao === u.restricao.nome,u.restricao.id = result.id_restricao );
			if (encontrou) {
				u.restricao.id = encontrou.id_restricao
				u.restricao.vincularRestricao(connection,req.session.login,u.curso.id, u.restricao.id)
				res.redirect('/restricao')
			} else {
				console.log(`${u.restricao.nome} não está na lista de restrições.`);
				u.restricao.adicionar(connection,function(result){
					u.restricao.id = result.insertId;
					u.restricao.vincularRestricao(connection,req.session.login,u.curso.id,u.restricao.id)
					res.redirect('/restricao') 
				})
			} 
		});
	})
});

//listarestricoes
app.get("/listarestricoes", (req, res) => {
	const u = new Usuario();
	u.restricao.listar(connection,function(result){
		res.render("listarestricoes", { restricao: result });
	})
});
app.post("/listarestricoes", (req, res) => {
	const buttonClicked = req.body.button;
	console.log(buttonClicked)
	if (buttonClicked === "Nova Restrição") {
		res.render("addrestricao");
	} else if (buttonClicked === "Atualizar Restrição") {
	} else if (buttonClicked === "Excluir Restrição") {
	}
});

//addrestricao
app.post('/addrestricao',(req,res)=>{
	 const r = new RestricaoAlimentar()
	 r.nome = req.body.nome
	 r.listar(connection,function(result){
		console.log(result)

		const encontrou = result.some(item => item.nome_restricao === r.nome);
		if(encontrou){
			console.log('Já cadastrado')
		} else{
			r.adicionar(connection,function(result){
				res.render('sucesso',{mensagem:"Restrição adcionada com sucesso!",link:"/listarestricoes"})
			})
		}
	 })
})

//attsenha
app.get("/attsenha", (req, res) => {
	res.render("attsenha");
});

//attcadastro
app.get("/attcadastro", (req, res) => {
	res.render("attcadastro");
});

//feedback
app.get("/feedback", (req, res) => {
	if (req.session.login) {
		res.render("feedback");
	} else {
		res.redirect("/login");
	}
});
