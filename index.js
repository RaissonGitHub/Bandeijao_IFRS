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

//Configuração do banco
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

//Configuração das sessoes
const session = require("express-session");
app.use(session({ secret: "seu_segredo_de_sessao", resave: false, saveUninitialized: true }));

//Servidor listen
app.listen(3000, function () {
	console.log("Servidor no ar - Porta 3000!");
});

//Rotas

//login
app.get("/login", function (req, res) {
	//Se estiver logado
	if (req.session.login) {
		res.render("index");
	} else {
		res.render("login");
	}
});
app.post("/login", function (req, res) {
	const u = new Usuario();
	//obter dados do formulario
	u.cpf = req.body.cpf;
	u.senha = req.body.senha;

	//verifica se os dados batem com os do banco
	u.verificarCredenciais(connection, u.cpf, u.senha, (error, user) => {
		if (error) {
			return res.render("login");
		}
		//logado com sucesso
		req.session.login = user.cpf; //disponivel durante a sessao
		res.render("index");
	});
});
//Perfil
app.get("/perfil", (req, res) => {
	if (req.session.login) {
		//se logado
		const u = new Usuario();
		u.cpf = req.session.login;
		//listagem dos dados do usuario
		u.listarCredenciais(connection, function (result) {
			const credenciais = result[0];
			//listagem das restricoes do usuario
			u.restricao.listarEspecifica(connection, u.cpf, function (result) {
				res.render("perfil", { usuario: credenciais, restricoes: result });
			});
		});
	} else {
		//nao logado
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
	//listagem dos cursos para serem selecionados no formulario de cadastro de usuario
	c.listar(connection, function (result) {
		res.render("cadastro", { cursos: result });
	});
});

//Cadastro post
app.post("/cadastro", function (req, res) {
	const buttonClicked = req.body.button;
	const u = new Usuario();

	//obtenção dos dados
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
		//cadastrar os dados do formulario
		u.cadastrar(connection);
		//carregar pagina de sucesso
		res.render("sucesso", { mensagem: "Cadastro concluido com sucesso!", link: "/perfil" });
	} else if (buttonClicked === "Cancelar") {
		res.redirect("/");
	}
});

//usuarios
app.get("/usuarios", (req, res) => {
	const u = new Usuario();
	//listagem de todos os usuarios
	u.listar(connection, function (result) {
		res.render("usuarios", { usuario: result });
	});
});

app.post("/usuarios", (req, res) => {
	const buttonClicked = req.body.button;
	if (buttonClicked === "Novo Usuário") {
		const c = new Curso();
		//listagem dos cursos para serem selecionados no formulario de cadastro de usuario
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
	//listagem de todos os cursos cadastrados
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
	//obtenção dos dados
	c.nome = req.body.nome;
	c.tempo = req.body.tempo;
	c.modalidade = req.body.modalidade;
	//cadastrar os dados
	c.cadastrar(connection);
	//carregar pagina de sucesso
	res.render("sucesso", { mensagem: "Cadastro de curso com sucesso!", link: "/curso" });
});

//cardapio
app.get("/cardapio", (req, res) => {
	const cardapio = new Cardapio();
	//listar os cardapios cadastrados
	cardapio.listar(connection, function (result) {
		res.render("cardapio", { cardapios: result });
	});
});

//listacardapio
app.post("/listacardapio", (req, res) => {
	const c = new Cardapio();
	c.id = req.body.checkbox; //variavel para saber qual caixa foi marcada
	id = c.id; //variavel global para saber qual caixa foi marcada
	const buttonClicked = req.body.button;
	if (buttonClicked === "Novo Cardapio") {
		res.render("addcardapio");
	} else if (buttonClicked === "Atualizar Cardapio") {
	} else if (buttonClicked === "Adicionar Alimento") {
		//se um cardapio for marcado
		if (c.id) {
			const a = new Alimento();
			//listar todos os alimentos disponiveis
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

	c.listarCardapioseAlimentos(connection, function (result) {
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
					(cardapios[cardapioId].alimentos = []); //array para saber os alimentos associados do cardapio especifico
			}
			//se id_alimento não é nulo adicionar alimento
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
	//obter os dados
	c.dia = req.body.dia;
	c.descricao = req.body.descricao;
	c.imagem = req.body.imagem;
	c.tipo = req.body.tipo;
	c.valor = req.body.valor;
	//cadastrar os dados
	c.inserir(connection);
	//carregar pagina de sucesso
	res.render("sucesso", { mensagem: "Cadastro de cardapio concluido com sucesso!", link: "/listacardapio" });
});

//vincalimento (vincular alimentos a um cardapio)
app.post("/vincalimentos", (req, res) => {
	const buttonClicked = req.body.button;
	const c = new Cardapio();
	c.id = id; //pega o id do cardapio que foi marcado em /listacardapio
	c.idalimento = req.body.checkbox; //alimento selecionado com checkbox
	if (buttonClicked === "Adicionar Alimento") {
		for (let a of c.idalimento) {
			//para cada alimento selecionado
			c.inserirAlimentoNoCardapio(connection, a); //vincular ao cardapio
		}
		//renderizar pagina de sucesso
		res.render("sucesso", { mensagem: "Alimento vinculado com sucesso!", link: "/listacardapio" });
	} else if (buttonClicked === "Desvincular Alimento") {
	}
});

let id = ""; //variavel usada para pegar o id dos cardapios

//refeicao
app.get("/refeicao/:id", (req, res) => {
	const c = new Cardapio();
	id = req.params.id; //pega o id do cardapio definido como parametro
	//listagem desse cardapio a partir do id
	c.listaEspecifica(connection, id, function (result) {
		//obtenção dos dados
		c.dia = result[0].dia;
		c.tipo = result[0].tipo;
		c.descricao = result[0].descricao;
		c.valor = result[0].valor;
		c.alimentos = []; //array para guardas os alimentos do cardapio
		result.forEach((row) => {
			if (c.alimentos.indexOf(row) == -1) {
				//se o alimento não estiver no array
				const a = new Alimento();
				(a.nome = row.nome_alimento), (a.unidade = row.unidade), (a.valorNutricional = row.valor_nutricional), c.alimentos.push(a); //coloque no array
			}
		});
		//carregue a pagina de refeicao com os dados do cardapio selecionado
		res.render("refeicao", { cardapio: c });
	});
});

//refeicaoconfirm
app.post("/refeicaoconfirm", (req, res) => {
	const c = new Cardapio();
	//listagem desse cardapio a partir do id de /refeicao
	c.listaEspecifica(connection, id, function (result) {
		//obtenção dos dados
		c.dia = result[0].dia;
		c.tipo = result[0].tipo;
		c.descricao = result[0].descricao;
		c.valor = result[0].valor;
		c.alimentos = []; //array para guardas os alimentos do cardapio
		result.forEach((row) => {
			if (c.alimentos.indexOf(row) == -1) {
				//se o alimento não estiver no array
				const a = new Alimento();
				(a.nome = row.nome_alimento), (a.unidade = row.unidade), (a.valorNutricional = row.valor_nutricional), c.alimentos.push(a); //coloque no array
			}
		});
		res.render("refeicaoconfirm", { cardapio: c });
	});
});

//Pedidos
app.get("/pedidos", function (req, res) {
	if (req.session.login) {
		//se logado
		const p = new Pedido();
		p.usuario.cpf = req.session.login; //obter o cpf do usuario pelo login
		//listar os pedidos do usuario pelo cpf
		p.listar(connection, function (result) {
			res.render("pedidos", { pedido: result });
		});
	} else {
		//nao logado
		res.redirect("/login");
	}
});

//Pedidos post
app.post("/pedidos", function (req, res) {
	if (req.session.login) {
		//se logado
		const buttonClicked = req.body.button;
		if (buttonClicked === "Novo Pedido") {
			const cardapio = new Cardapio();
			//listar os dados dos cardapios disponiveis
			cardapio.listar(connection, function (result) {
				res.render("cardapio", { cardapios: result });
			});
		} else if (buttonClicked === "Atualizar Pedido") {
			//aqui se o usuario nao pagou ele pode efetuar o pagamento
			const p = new Pedido();
			pedidoId = req.body.checkbox; //saber qual pedido foi marcado
			p.usuario.cpf = req.session.login; //saber qual o cpf a partir do login
			//listar o pedido vinculado ao cpf
			p.listarPedido(connection, pedidoId, function (result) {
				//retorno so de um pedido
				//se este pedido estiver como pago
				if (result[0].pagamento === "pago") {
					console.log("Pedidos pagos não podem ser editados");
				} else {
					//se estiver pendente
					//mandar para pagcartao onde podera efetuar o pagamento
					res.render(`pagcartao`);
				}
			});
		} else if (buttonClicked === "Excluir Pedido") {
		}
	} else {
		//nao logado
		res.redirect("/login");
	}
});

//listapedido
app.get("/listapedido", function (req, res) {
	const p = new Pedido();
	//listar todos os pedidos registrados
	p.listarTodos(connection, function (result) {
		res.render("listapedidos", { pedido: result });
	});
});
app.post("/listapedido", function (req, res) {
	const buttonClicked = req.body.button;
	if (buttonClicked === "Novo Pedido") {
		//ao clicar em novo pedido sera redirecionado para a pagina de cardapios
		const cardapio = new Cardapio();
		//carregar os cardapios disponiveis
		cardapio.listar(connection, function (result) {
			res.render("cardapio", { cardapios: result });
		});
	} else if (buttonClicked === "Atualizar Pedido") {
	} else if (buttonClicked === "Excluir Pedido") {
	}
});

let pedidoId = ""; //variavel global para armazenar o id de pedidos

//realizarpedido
app.post("/realizarpedido", function (req, res) {
	if (req.session.login) { //se logado
		const p = new Pedido();
		//pagamento definido como pendente
		p.pagamento = "pendente";
		//obtenção dos dados
		p.observacao = req.body.observacao;
		p.usuario.cpf = req.session.login; //obter o cpf pelo login
		//pegar o id do curso a partir do cpf
		p.usuario.listarCredenciais(connection, function (result) {
			p.usuario.curso.nome = result[0].curso_id_curso;
			//fazer pedido
			p.fazerPedido(connection, id, function (novoID) {
				//armazenar o id do pedido recem cadastrado
				pedidoId = novoID;
				res.render("pagcartao", { pedidoId: novoID });
			});
		});
	} else { //nao logado
		res.redirect("/login");
	}
});

//pagcartao pagina para pagar o pedido (colocar como "pago")
app.post("/pagcartao", (req, res) => {
	if (req.session.login) { //se logado
		//se os campos não estiver vazios (validação a ser desenvolvida)
		if (req.body.cartaonumero && req.body.cartaonome && req.body.cartaovalidade && req.body.cartaocvv) {
			const p = new Pedido();
			//pedido pago mudando o campo pagamento para pago
			p.pagarPedido(connection, pedidoId);
			p.usuario.cpf = req.session.login;
			//redirecionado para a pagina de pedidos
			//listar antes de carregar
			p.listar(connection, function (result) {
				res.render("pedidos", { pedido: result });
			});
		}
	} else {//nao logado
		res.redirect("/login");
	}
});

//alimentos
app.get("/alimentos", (req, res) => {
	const a = new Alimento();
	//listar todos os alimentos
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
	//obtençao dos dados
	a.nome = req.body.nome;
	a.unidade = req.body.unidade;
	a.valorNutricional = req.body.valornutri;
	//cadastrar
	a.cadastrar(connection);
	//carregar a pagina de sucesso
	res.render("sucesso", { mensagem: "Alimento cadastrado com sucesso!", link: "/alimentos" });
});

//restricao
app.get("/restricao", (req, res) => {
	if (req.session.login) {//se logado
		const u = new Usuario();
		//listar as restrições do usuario
		u.restricao.listarEspecifica(connection, req.session.login, function (result) {
			u.restricoes = result;//armazenar as restrições
			//listar todas as restrições disponiveis
			u.restricao.listar(connection, function (result) {
				res.render("restricoes", { restricoes: u.restricoes, lista: result });
			});
		});
	} else { //nao logado
		res.redirect("/login");
	}
});

app.post("/restricao", function (req, res) {
	const u = new Usuario();
	u.cpf = req.session.login;
	//pegar informações do usuario
	u.listarCredenciais(connection, function (result) {
		u.curso.id = result[0].curso_id_curso;
		u.restricao.nome = req.body.addrestricao;
		//pesquisar se a restrição digitada esta no banco
		u.restricao.listar(connection, function (result) {
			const encontrou = result.find((item) => item.nome_restricao === u.restricao.nome, (u.restricao.id = result.id_restricao)); //variavel que procura se a restrição está no banco e tambem retorna seu id
			if (encontrou) {//se encontrou no banco
				u.restricao.id = encontrou.id_restricao;
				//vincule o alimento do banco ao usuario
				u.restricao.vincularRestricao(connection, req.session.login, u.curso.id, u.restricao.id);
				res.redirect("/restricao");
			} else {//se nao encontrou no banco
				//adicione a restrição no banco
				u.restricao.adicionar(connection, function (result) {
					//pegue o id da restrição recem registrada
					u.restricao.id = result.insertId;
					//vincule-a ao usuario
					u.restricao.vincularRestricao(connection, req.session.login, u.curso.id, u.restricao.id);
					res.redirect("/restricao");
				});
			}
		});
	});
});

//listarestricoes
app.get("/listarestricoes", (req, res) => {
	const u = new Usuario();
	//listar todas as restricoes do banco
	u.restricao.listar(connection, function (result) {
		res.render("listarestricoes", { restricao: result });
	});
});
app.post("/listarestricoes", (req, res) => {
	const buttonClicked = req.body.button;
	console.log(buttonClicked);
	if (buttonClicked === "Nova Restrição") {
		res.render("addrestricao");
	} else if (buttonClicked === "Atualizar Restrição") {
	} else if (buttonClicked === "Excluir Restrição") {
	}
});

//addrestricao
app.post("/addrestricao", (req, res) => {
	const r = new RestricaoAlimentar();
	//obtenção dos dados
	r.nome = req.body.nome;
	//verificar se a restrição está no banco
	r.listar(connection, function (result) {
		const encontrou = result.some((item) => item.nome_restricao === r.nome); //variavel que verifica a presença da restrição no banco
		if (encontrou) {//se encontrou
			console.log("Já cadastrado"); //nao cadastre
		} else {//se nao encontrou
			//adicione a restrição
			r.adicionar(connection, function (result) {
				res.render("sucesso", { mensagem: "Restrição adcionada com sucesso!", link: "/listarestricoes" });
			});
		}
	});
});

// a fazer

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
