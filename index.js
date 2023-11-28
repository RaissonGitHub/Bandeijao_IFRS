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
const Mensagem = require("./models/Mensagem");
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

var logado = false;
var adm;
//req.session.login? logado = true: logado=false

//Rotas
//login
app.get("/login", function (req, res) {
	//Se estiver logado

	if (req.session.login) {
		logado = true;
		res.render("index", { logado });
	} else {
		logado = false;
		res.render("login");
	}
});
app.post("/login", function (req, res) {
	const u = new Usuario();
	//obter dados do formulario
	u.cpf = req.body.cpf;
	u.senha = req.body.senha;

	//verifica se os dados batem com os do banco
	u.verificarCredenciais(connection, u.cpf, u.senha, (error, user, perfil) => {
		if (error) {
			return res.render("login");
		}
		//logado com sucesso
		req.session.login = user.cpf; //disponivel durante a sessao
		req.session.login ? (logado = true) : (logado = false);
		adm = perfil;
		res.render("index", { logado, adm });
	});
});

app.get("/logout", function (req, res) {
	// Destrua a sessão para fazer logout
	req.session.destroy(function (err) {
		if (err) {
			console.log(err);
		} else {
			logado = false;
			res.render("index", { logado, adm });
		}
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
				res.render("perfil", { usuario: credenciais, restricoes: result, logado, adm });
			});
		});
	} else {
		//nao logado
		res.redirect("/login");
	}
});

//Index
app.get("/", function (req, res) {
	res.render("index", { logado, adm });
});

//Cadastro
app.get("/cadastro", function (req, res) {
	const c = new Curso();
	//listagem dos cursos para serem selecionados no formulario de cadastro de usuario
	c.listar(connection, function (result) {
		res.render("cadastro", { cursos: result, logado, adm });
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
		res.render("sucesso", { logado, adm, mensagem: "Cadastro concluido com sucesso!", link: "/perfil" });
	} else if (buttonClicked === "Cancelar") {
		res.redirect("/");
	}
});

//usuarios
app.get("/usuarios", (req, res) => {
	const u = new Usuario();
	//listagem de todos os usuarios
	u.listar(connection, function (result) {
		res.render("usuarios", { usuario: result, logado, adm });
	});
});

app.post("/usuarios", (req, res) => {
	const buttonClicked = req.body.button;
	if (buttonClicked === "Novo Usuário") {
		const c = new Curso();
		//listagem dos cursos para serem selecionados no formulario de cadastro de usuario
		c.listar(connection, function (result) {
			res.render("cadastro", { cursos: result, logado, adm });
		});
	} else if (buttonClicked === "Atualizar Usuário") {
	} else if (buttonClicked === "Excluir Usuário") {
	}
});

app.post("/filtrarUsuario", (req, res) => {
	const u = new Usuario();
	u.nome = "%" + req.body.filtro + "%";
	u.filtrarUsuario(connection, function (result) {
		res.render("usuarios", { usuario: result, logado, adm });
	});
});

//curso
app.get("/curso", (req, res) => {
	const c = new Curso();
	//listagem de todos os cursos cadastrados
	c.listar(connection, function (result) {
		res.render("cursos", { cursos: result, logado, adm });
	});
});

let selecao

app.post("/curso", (req, res) => {
	let acao = req.body.button;
	selecao = req.body.selecao

	if (acao == "Novo Curso") {
		const c = new Curso();
		res.render("addcurso", { logado, adm, acao: "Cadastro", envio: "Cadastrar",curso:c });
	} else {
		if (acao == "Atualizar Curso") {
			const c = new Curso();
			c.id = selecao
			c.listarCurso(connection,function(result){
				res.render("addcurso", { logado, adm,acao: "Atualização", envio: "Atualizar", curso:result[0] });

			})
		} else {
		}
	}
});

//addcurso
app.post("/addcurso", (req, res) => {
	let envio = req.body.button;
	if (envio == "Enviar") {
		const c = new Curso();
		//obtenção dos dados
		c.nome = req.body.nome;
		c.tempo = req.body.tempo;
		c.modalidade = req.body.modalidade;
		//cadastrar os dados
		c.cadastrar(connection);
		//carregar pagina de sucesso
		res.render("sucesso", { logado, adm, mensagem: "Cadastro de curso com sucesso!", link: "/curso" });
	}
	else{
		if(envio == "Atualizar"){
			const c = new Curso();
		//obtenção dos dados
		c.nome = req.body.nome;
		c.id =selecao
		c.tempo = req.body.tempo;
		c.modalidade = req.body.modalidade;
		c.atualizar(connection)
		res.render("sucesso", { logado, adm, mensagem: "Atualização de curso efetuada com sucesso!", link: "/curso" });

		}
	}
});

//cardapio
app.get("/cardapio", (req, res) => {
	const cardapio = new Cardapio();
	//listar os cardapios cadastrados
	cardapio.listar(connection, function (result) {
		res.render("cardapio", { cardapios: result, logado, adm });
	});
});

//listacardapio
app.post("/listacardapio", (req, res) => {
	const c = new Cardapio();
	c.id = req.body.checkbox; //variavel para saber qual caixa foi marcada
	id = c.id; //variavel global para saber qual caixa foi marcada
	const buttonClicked = req.body.button;
	if (buttonClicked === "Novo Cardapio") {
		res.render("addcardapio", { logado, adm });
	} else if (buttonClicked === "Atualizar Cardapio") {
	} else if (buttonClicked === "Adicionar Alimento") {
		//se um cardapio for marcado
		if (c.id) {
			const a = new Alimento();
			//listar todos os alimentos disponiveis
			a.listar(connection, function (result) {
				res.render("vincalimento", { c: c, alimento: result, logado, adm });
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

		res.render("listacardapio", { cardapios: cardapios, logado, adm });
	});
});

//addcardapio
app.get("/addcardapio", (req, res) => {
	res.render("addcardapio", { logado, adm });
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
	res.render("sucesso", { logado, adm, mensagem: "Cadastro de cardapio concluido com sucesso!", link: "/listacardapio" });
});

//vincalimento (vincular alimentos a um cardapio)
app.post("/vincalimentos", (req, res) => {
	const buttonClicked = req.body.button;
	const c = new Cardapio();
	c.id = id; //pega o id do cardapio que foi marcado em /listacardapio
	const ali = req.body.checkbox; //alimento selecionado com checkbox
	if (buttonClicked === "Adicionar Alimento") {
		for (let a of ali) {
			//para cada alimento selecionado
			c.inserirAlimentoNoCardapio(connection, a); //vincular ao cardapio
		}
		//renderizar pagina de sucesso
		res.render("sucesso", { logado, adm, mensagem: "Alimento vinculado com sucesso!", link: "/listacardapio" });
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
		res.render("refeicao", { cardapio: c, logado, adm });
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
		res.render("refeicaoconfirm", { cardapio: c, logado, adm });
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
			res.render("pedidos", { pedido: result, logado, adm });
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
				res.render("cardapio", { cardapios: result, logado, adm });
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
					res.render(`pagcartao`, { logado });
				}
			});
		} else if (buttonClicked === "Excluir Pedido") {
		}
	} else {
		//nao logado
		res.redirect("/login");
	}
});

app.post("/filtrarPedidos", (req, res) => {
	const p = new Pedido();
	p.id = "%" + req.body.filtro + "%";
	p.filtrarPedido(connection, function (result) {
		res.render("pedidos", { pedido: result, logado, adm });
	});
});

//listapedido
app.get("/listapedido", function (req, res) {
	const p = new Pedido();
	//listar todos os pedidos registrados
	p.listarTodos(connection, function (result) {
		res.render("listapedidos", { pedido: result, logado, adm });
	});
});
app.post("/listapedido", function (req, res) {
	const buttonClicked = req.body.button;
	if (buttonClicked === "Novo Pedido") {
		//ao clicar em novo pedido sera redirecionado para a pagina de cardapios
		const cardapio = new Cardapio();
		//carregar os cardapios disponiveis
		cardapio.listar(connection, function (result) {
			res.render("cardapio", { cardapios: result, logado, adm });
		});
	} else if (buttonClicked === "Atualizar Pedido") {
	} else if (buttonClicked === "Excluir Pedido") {
	}
});

app.post("/filtrarListaPedidos", (req, res) => {
	const p = new Pedido();
	p.id = "%" + req.body.filtro + "%";
	p.filtrarPedido(connection, function (result) {
		res.render("listapedidos", { pedido: result, logado, adm });
	});
});

let pedidoId = ""; //variavel global para armazenar o id de pedidos

//realizarpedido
app.post("/realizarpedido", function (req, res) {
	if (req.session.login) {
		//se logado
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
				res.render("pagcartao", { pedidoId: novoID, logado, adm });
			});
		});
	} else {
		//nao logado
		res.redirect("/login");
	}
});

//pagcartao pagina para pagar o pedido (colocar como "pago")
app.post("/pagcartao", (req, res) => {
	if (req.session.login) {
		//se logado
		//se os campos não estiver vazios (validação a ser desenvolvida)
		if (req.body.cartaonumero && req.body.cartaonome && req.body.cartaovalidade && req.body.cartaocvv) {
			const p = new Pedido();
			//pedido pago mudando o campo pagamento para pago
			p.pagarPedido(connection, pedidoId);
			p.usuario.cpf = req.session.login;
			//redirecionado para a pagina de pedidos
			//listar antes de carregar
			p.listar(connection, function (result) {
				res.render("pedidos", { pedido: result, logado, adm });
			});
		}
	} else {
		//nao logado
		res.redirect("/login");
	}
});

//alimentos
app.get("/alimentos", (req, res) => {
	const a = new Alimento();
	//listar todos os alimentos
	a.listar(connection, function (result) {
		res.render("alimentos", { alimento: result, logado, adm });
	});
});
app.post("/alimentos", (req, res) => {
	const buttonClicked = req.body.button;
	if (buttonClicked === "Novo Alimento") {
		res.render("addalimento", { logado, adm });
	} else if (buttonClicked === "Atualizar Alimento") {
	} else if (buttonClicked === "Excluir Alimento") {
	}
});

app.post("/filtrarAlimentos", (req, res) => {
	const a = new Alimento();
	a.nome = "%" + req.body.filtro + "%";
	a.filtrarAlimento(connection, function (result) {
		res.render("alimentos", { alimento: result, logado, adm });
	});
});

//addalimento
app.get("/addalimento", (req, res) => {
	res.render("addalimento", { logado, adm });
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
	res.render("sucesso", { logado, adm, mensagem: "Alimento cadastrado com sucesso!", link: "/alimentos" });
});

//restricao
app.get("/restricao", (req, res) => {
	if (req.session.login) {
		//se logado
		const u = new Usuario();
		//listar as restrições do usuario
		u.restricao.listarEspecifica(connection, req.session.login, function (result) {
			u.restricoes = result; //armazenar as restrições
			//listar todas as restrições disponiveis
			u.restricao.listar(connection, function (result) {
				res.render("restricoes", { restricoes: u.restricoes, lista: result, logado, adm });
			});
		});
	} else {
		//nao logado
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
			if (encontrou) {
				//se encontrou no banco
				u.restricao.id = encontrou.id_restricao;
				//vincule o alimento do banco ao usuario
				u.restricao.vincularRestricao(connection, req.session.login, u.curso.id, u.restricao.id);
				res.redirect("/restricao");
			} else {
				//se nao encontrou no banco
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
		res.render("listarestricoes", { restricao: result, logado, adm });
	});
});
app.post("/listarestricoes", (req, res) => {
	const buttonClicked = req.body.button;
	if (buttonClicked === "Nova Restrição") {
		res.render("addrestricao", { logado, adm });
	} else if (buttonClicked === "Atualizar Restrição") {
	} else if (buttonClicked === "Excluir Restrição") {
	}
});

app.post("/filtrarRestricao", (req, res) => {
	const r = new RestricaoAlimentar();
	r.nome = "%" + req.body.filtro + "%";
	r.filtrarRestricao(connection, function (result) {
		res.render("listarestricoes", { restricao: result, logado, adm });
	});
});

//addrestricao
app.post("/addrestricao", (req, res) => {
	const r = new RestricaoAlimentar();
	//obtenção dos dados
	r.nome = req.body.nome;
	//verificar se a restrição está no banco
	r.listar(connection, function (result) {
		const encontrou = result.some((item) => item.nome_restricao === r.nome); //variavel que verifica a presença da restrição no banco
		if (encontrou) {
			//se encontrou
			console.log("Já cadastrado"); //nao cadastre
		} else {
			//se nao encontrou
			//adicione a restrição
			r.adicionar(connection, function (result) {
				res.render("sucesso", { mensagem: "Restrição adcionada com sucesso!", link: "/listarestricoes", logado, adm });
			});
		}
	});
});

// a fazer

//attsenha
app.get("/attsenha", (req, res) => {
	res.render("attsenha", { logado, adm });
});

//attcadastro
app.get("/attcadastro", (req, res) => {
	const u = new Usuario();
	const c = new Curso();
	u.cpf = req.session.login;
	c.listar(connection, function (result1) {
		u.listarCredenciais(connection, function (result2) {
			res.render("attcadastro", { cursos: result1, usuario: result2[0], logado, adm });
		});
	});
});

//feedback
app.get("/feedback", (req, res) => {
	if (req.session.login) {
		res.render("feedback", { logado, adm });
	} else {
		res.redirect("/login");
	}
});
app.post("/feedback", (req, res) => {
	const u = new Usuario();
	u.cpf = req.session.login;
	u.mensagem.assunto = req.body.assunto;
	u.mensagem.mensagem = req.body.mensagem;
	u.listarCredenciais(connection, function (result) {
		u.curso.nome = result[0].curso_id_curso;
		u.mensagem.cadastrar(connection, u.cpf, u.curso.nome);
		res.render("sucesso", { mensagem: "Mensagem enviada", link: "/listafeedback", logado, adm });
	});
});

//listafeedback
app.get("/listafeedback", (req, res) => {
	const u = new Usuario();
	u.mensagem.listar(connection, function (result) {
		res.render("listafeedback", { mensgens: result, logado, adm });
	});
});
app.post("/listafeedback", (req, res) => {
	const buttonClicked = req.body.button;
	if (buttonClicked === "Nova Mensagem") {
		res.redirect("/feedback");
	} else if (buttonClicked === "Atualizar Mensagem") {
	} else if (buttonClicked === "Excluir Mensagem") {
	}
});
