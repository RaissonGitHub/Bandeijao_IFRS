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

		res.render("index", { logado, adm, aviso: "" });
	});
});

app.get("/logout", function (req, res) {
	// Destrua a sessão para fazer logout
	req.session.destroy(function (err) {
		if (err) {
			console.log(err);
		} else {
			logado = false;
			res.render("index", { logado, adm, aviso: "" });
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
				res.render("perfil", { aviso: "", usuario: credenciais, restricoes: result, logado, adm });
			});
		});
	} else {
		//nao logado
		res.redirect("/login");
	}
});

//Index
app.get("/", function (req, res) {
	res.render("index", { logado, adm, aviso: "" });
});

//Cadastro
app.get("/cadastro", function (req, res) {
	const c = new Curso();
	//listagem dos cursos para serem selecionados no formulario de cadastro de usuario
	c.listar(connection, function (result) {
		res.render("cadastro", { aviso: "", cursos: result, logado, adm });
	});
});

//Cadastro post
app.post("/cadastro", function (req, res) {
	const buttonClicked = req.body.button;
	const u = new Usuario();
	if (req.body.senha == req.body.rsenha) {
		//obtenção dos dados
		u.nome = req.body.nome;
		u.sobrenome = req.body.sobrenome;
		u.matricula = req.body.matricula;
		u.cpf = req.body.cpf;
		u.telefone = req.body.telefone;
		u.email = req.body.email;
		u.caracAlimenticia = req.body.escolha;
		u.senha = req.body.senha;
		u.curso.id = req.body.curso;

		if (buttonClicked === "Enviar") {
			//cadastrar os dados do formulario
			u.cadastrar(connection);
			//carregar pagina de sucesso
			res.render("sucesso", { aviso: "", logado, adm, mensagem: "Cadastro concluido com sucesso!", link: "/perfil" });
		} else if (buttonClicked === "Cancelar") {
			res.redirect("/");
		}
	} else {
		const c = new Curso();
		//listagem dos cursos para serem selecionados no formulario de cadastro de usuario
		c.listar(connection, function (result) {
			res.render("cadastro", { aviso: "Senhas diferentes", cursos: result, logado, adm });
		});
	}
});

//usuarios
app.get("/usuarios", (req, res) => {
	if (req.session.login && adm) {
		const u = new Usuario();
		//listagem de todos os usuarios
		u.listar(connection, function (result) {
			res.render("usuarios", { aviso: "", usuario: result, logado, adm });
		});
	} else {
		res.redirect("/");
	}
});

app.post("/usuarios", (req, res) => {
	const buttonClicked = req.body.button;
	if (buttonClicked === "Novo Usuário") {
		const c = new Curso();
		//listagem dos cursos para serem selecionados no formulario de cadastro de usuario
		c.listar(connection, function (result) {
			res.render("cadastro", { aviso: "", cursos: result, logado, adm });
		});
	} else if (buttonClicked === "Atualizar Usuário") {
		let opcao = req.body.cpf;
		if (!opcao) {
			const u = new Usuario();
			//listagem de todos os usuarios
			u.listar(connection, function (result) {
				res.render("usuarios", { aviso: "Selecione um usuário", usuario: result, logado, adm });
			});
		} else {
			const u = new Usuario();
			const c = new Curso();
			u.cpf = opcao;
			c.listar(connection, function (result1) {
				u.listarCredenciais(connection, function (result2) {
					res.render("attcadastro", { aviso: "", cursos: result1, usuario: result2[0], link: "/usuarios", logado, adm });
				});
			});
		}
	} else if (buttonClicked === "Excluir Usuário") {
		let opcao = req.body.cpf;
		if (!opcao) {
			const u = new Usuario();
			//listagem de todos os usuarios
			u.listar(connection, function (result) {
				res.render("usuarios", { aviso: "Selecione um usuário", usuario: result, logado, adm });
			});
		} else {
			const u = new Usuario();
			u.cpf = opcao;
			u.deletar(connection);
			u.listar(connection, function (result) {
				res.render("usuarios", { aviso: "", usuario: result, logado, adm });
			});
		}
	}
});

app.post("/filtrarUsuario", (req, res) => {
	const u = new Usuario();
	u.nome = "%" + req.body.filtro + "%";
	u.filtrarUsuario(connection, function (result) {
		res.render("usuarios", { aviso: "", usuario: result, logado, adm });
	});
});

//curso
app.get("/curso", (req, res) => {
	if (req.session.login && adm) {
		const c = new Curso();
		//listagem de todos os cursos cadastrados
		c.listar(connection, function (result) {
			res.render("cursos", { aviso: "", cursos: result, logado, adm });
		});
	} else {
		res.redirect("/");
	}
});

let selecao;

app.post("/curso", (req, res) => {
	let acao = req.body.button;

	if (acao == "Novo Curso") {
		const c = new Curso();
		res.render("addcurso", { aviso: "", logado, adm, acao: "Cadastro", envio: "Cadastrar", curso: c });
	} else {
		if (acao == "Atualizar Curso") {
			selecao = req.body.selecao;
			if (!selecao) {
				const c = new Curso();
				//listagem de todos os cursos cadastrados
				c.listar(connection, function (result) {
					res.render("cursos", { aviso: "Selecione um curso", cursos: result, logado, adm });
				});
			} else {
				const c = new Curso();
				c.id = selecao;
				c.listarCurso(connection, function (result) {
					res.render("addcurso", { aviso: "", logado, adm, acao: "Atualização", envio: "Atualizar", curso: result[0] });
				});
			}
		} else {
			selecao = req.body.selecao;
			if (!selecao) {
				const c = new Curso();
				//listagem de todos os cursos cadastrados
				c.listar(connection, function (result) {
					res.render("cursos", { aviso: "Selecione um curso", cursos: result, logado, adm });
				});
			} else {
				const c = new Curso();
				c.id = selecao;
				c.excluir(connection);
				c.listar(connection, function (result) {
					res.render("cursos", { aviso: "", cursos: result, logado, adm });
				});
			}
		}
	}
});

//addcurso
app.post("/addcurso", (req, res) => {
	let envio = req.body.button;
	if (envio == "Cadastrar") {
		const c = new Curso();
		//obtenção dos dados
		c.nome = req.body.nome;
		c.tempo = req.body.tempo;
		c.modalidade = req.body.modalidade;
		//cadastrar os dados
		c.cadastrar(connection);
		//carregar pagina de sucesso
		res.render("sucesso", { aviso: "", logado, adm, mensagem: "Cadastro de curso com sucesso!", link: "/curso" });
	} else {
		if (envio == "Atualizar") {
			const c = new Curso();
			//obtenção dos dados
			c.nome = req.body.nome;
			c.id = selecao;
			c.tempo = req.body.tempo;
			c.modalidade = req.body.modalidade;
			c.atualizar(connection);
			res.render("sucesso", { aviso: "", logado, adm, mensagem: "Atualização de curso efetuada com sucesso!", link: "/curso" });
		}
	}
});

//cardapio
app.get("/cardapio", (req, res) => {
	const cardapio = new Cardapio();
	//listar os cardapios cadastrados
	cardapio.listar(connection, function (result) {
		res.render("cardapio", { aviso: "", cardapios: result, logado, adm });
	});
});

//listacardapio
app.post("/listacardapio", (req, res) => {
	const buttonClicked = req.body.button;
	if (buttonClicked === "Novo Cardapio") {
		const c = new Cardapio();
		res.render("addcardapio", { aviso: "", cardapio: c, acao: "Cadastrar", logado, adm });
	} else if (buttonClicked === "Atualizar Cardapio") {
		const selecao = req.body.checkbox;
		if (!selecao) {
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

				res.render("listacardapio", { aviso: "Selecione um cardápio", cardapios: cardapios, logado, adm });
			});
		} else {
			const c = new Cardapio();
			c.id = req.body.checkbox; //variavel para saber qual caixa foi marcada
			id = c.id; //variavel global para saber qual caixa foi marcada
			c.listaEspecifica(connection, function (result) {
				res.render("addcardapio", { aviso: "", cardapio: result[0], acao: "Atualizar", logado, adm });
			});
		}
	} else if (buttonClicked === "Mudar alimentos") {
		const selecao = req.body.checkbox;
		if (!selecao) {
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

				res.render("listacardapio", { aviso: "Selecione um cardápio", cardapios: cardapios, logado, adm });
			});
		} else {
			const c = new Cardapio();
			c.id = req.body.checkbox; //variavel para saber qual caixa foi marcada
			id = c.id; //variavel global para saber qual caixa foi marcada
			//se um cardapio for marcado
			const a = new Alimento();
			//listar todos os alimentos disponiveis
			a.listar(connection, function (result) {
				c.listaEspecifica(connection, function (result1) {
					res.render("vincalimento", { aviso: "", c: c, alimento: result, cali: result1, logado, adm });
				});
			});
		}
	} else if (buttonClicked === "Excluir Cardapio") {
		const selecao = req.body.checkbox;
		if (!selecao) {
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

				res.render("listacardapio", { aviso: "Selecione um cardápio", cardapios: cardapios, logado, adm });
			});
		} else {
			const c = new Cardapio();
			c.id = req.body.checkbox;
			c.excluir(connection);

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

				res.render("listacardapio", { aviso: "", cardapios: cardapios, logado, adm });
			});
		}
	}
});

app.get("/listacardapio", (req, res) => {
	if (req.session.login) {
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

			res.render("listacardapio", { aviso: "", cardapios: cardapios, logado, adm });
		});
	}
});

//addcardapio
app.get("/addcardapio", (req, res) => {
	if (req.session.login && adm) {
		res.render("addcardapio", { aviso: "", logado, adm });
	} else {
		res.redirect("/");
	}
});
app.post("/addcardapio", (req, res) => {
	const a = req.body.button;
	if (a == "Cadastrar") {
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
		res.render("sucesso", { aviso: "", logado, adm, mensagem: "Cadastro de cardapio concluido com sucesso!", link: "/listacardapio" });
	} else {
		if (a == "Atualizar") {
			const c = new Cardapio();
			//obter os dados
			c.id = id;
			c.dia = req.body.dia;
			c.descricao = req.body.descricao;
			c.imagem = req.body.imagem;
			c.tipo = req.body.tipo;
			c.valor = req.body.valor;
			c.atualizar(connection);
			res.render("sucesso", { logado, adm, mensagem: "Atualização de cardapio concluida com sucesso!", link: "/listacardapio" });
		}
	}
});

//vincalimento (vincular alimentos a um cardapio)
app.post("/vincalimentos", (req, res) => {
	const buttonClicked = req.body.button;
	const c = new Cardapio();
	c.id = id; //pega o id do cardapio que foi marcado em /listacardapio
	const ali = req.body.checkbox; //alimento selecionado com checkbox
	if (buttonClicked === "Adicionar Alimento") {
		if (!ali) {
			const c = new Cardapio();
			c.id = id 
			
			const a = new Alimento();
			//listar todos os alimentos disponiveis
			a.listar(connection, function (result) {
				c.listaEspecifica(connection, function (result1) {
					res.render("vincalimento", { aviso: "Selecione um alimento", c: c, alimento: result, cali: result1, logado, adm });
				});
			});
		} else {
			for (let a of ali) {
				//para cada alimento selecionado
				c.inserirAlimentoNoCardapio(connection, a); //vincular ao cardapio
			}
			//renderizar pagina de sucesso
			res.render("sucesso", { aviso: "", logado, adm, mensagem: "Alimento vinculado com sucesso!", link: "/listacardapio" });
		}
	} else if (buttonClicked === "Desvincular Alimento") {
		if (!ali) {
			const c = new Cardapio();
			c.id = id 
			
			const a = new Alimento();
			//listar todos os alimentos disponiveis
			a.listar(connection, function (result) {
				c.listaEspecifica(connection, function (result1) {
					res.render("vincalimento", { aviso: "Selecione um alimento", c: c, alimento: result, cali: result1, logado, adm });
				});
			});
		} else {
			for (let a of ali) {
				//para cada alimento selecionado
				c.desvincularAlimentoNoCarpio(connection, a); //vincular ao cardapio
				res.render("sucesso", { aviso: "", logado, adm, mensagem: "Alimento desvinculado com sucesso!", link: "/listacardapio" });
			}
		}
	}
});

let id = ""; //variavel usada para pegar o id dos cardapios

//refeicao
app.get("/refeicao/:id", (req, res) => {
	const c = new Cardapio();
	c.id = req.params.id; //pega o id do cardapio definido como parametro
	id = c.id;
	//listagem desse cardapio a partir do id
	c.listaEspecifica(connection, function (result) {
		//obtenção dos dados
		c.dia = result[0].dia;
		c.tipo = result[0].tipo;
		c.descricao = result[0].descricao;
		c.imagem = result[0].imagem;
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
		res.render("refeicao", { aviso: "", cardapio: c, logado, adm });
	});
});

//refeicaoconfirm
app.post("/refeicaoconfirm", (req, res) => {
	const c = new Cardapio();
	c.id = id;
	//listagem desse cardapio a partir do id de /refeicao
	c.listaEspecifica(connection, function (result) {
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
		res.render("refeicaoconfirm", { aviso: "", cardapio: c, logado, adm });
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
			res.render("pedidos", { aviso: "", pedido: result, logado, adm });
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
				res.render("cardapio", { aviso: "", cardapios: result, logado, adm });
			});
		} else if (buttonClicked === "Atualizar Pedido") {
			pedidoId = req.body.checkbox; //saber qual pedido foi marcado

			if (!pedidoId) {
				const p = new Pedido();
				p.usuario.cpf = req.session.login; //obter o cpf do usuario pelo login
				//listar os pedidos do usuario pelo cpf

				p.listar(connection, function (result) {
					res.render("pedidos", { aviso: "Selecione um pedido", pedido: result, logado, adm });
				});
			} else {
				//aqui se o usuario nao pagou ele pode efetuar o pagamento
				const p = new Pedido();
				p.usuario.cpf = req.session.login; //saber qual o cpf a partir do login
				//listar o pedido vinculado ao cpf
				p.listarPedido(connection, pedidoId, function (result) {
					//retorno so de um pedido
					//se este pedido estiver como pago
					if (result[0].pagamento === "pago") {
						p.listar(connection, function (result) {
							res.render("pedidos", { aviso: "Pedidos pagos não podem ser editados", pedido: result, logado, adm });
						});
					} else {
						//se estiver pendente
						//mandar para pagcartao onde podera efetuar o pagamento
						res.render(`pagcartao`, { aviso: "", logado, adm });
					}
				});
			}
		} else if (buttonClicked === "Excluir Pedido") {
			const p = new Pedido();
			const pedidoId = req.body.checkbox; //saber qual pedido foi marcado
			if (!pedidoId) {
				const p = new Pedido();
				p.usuario.cpf = req.session.login; //obter o cpf do usuario pelo login
				//listar os pedidos do usuario pelo cpf

				p.listar(connection, function (result) {
					res.render("pedidos", { aviso: "Selecione um pedido", pedido: result, logado, adm });
				});
			} else {
				p.id = pedidoId;
				p.excluir(connection);
				p.usuario.cpf = req.session.login; //obter o cpf do usuario pelo login
				//listar os pedidos do usuario pelo cpf

				p.listar(connection, function (result) {
					res.render("pedidos", { aviso: "", pedido: result, logado, adm });
				});
			}
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
		res.render("pedidos", { aviso: "", pedido: result, logado, adm });
	});
});

//listapedido
app.get("/listapedido", function (req, res) {
	if (req.session.login && adm) {
		const p = new Pedido();
		//listar todos os pedidos registrados
		p.listarTodos(connection, function (result) {
			res.render("listapedidos", { aviso: "", pedido: result, logado, adm });
		});
	}
});
app.post("/listapedido", function (req, res) {
	const buttonClicked = req.body.button;
	if (buttonClicked === "Novo Pedido") {
		//ao clicar em novo pedido sera redirecionado para a pagina de cardapios
		const cardapio = new Cardapio();
		//carregar os cardapios disponiveis
		cardapio.listar(connection, function (result) {
			res.render("cardapio", { aviso: "", cardapios: result, logado, adm });
		});
	} else if (buttonClicked === "Atualizar Pedido") {
		const opcao = req.body.checkbox;
		if (!opcao) {
			const p = new Pedido();
			p.usuario.cpf = req.session.login; //obter o cpf do usuario pelo login
			//listar os pedidos do usuario pelo cpf

			p.listarTodos(connection, function (result) {
				res.render("listapedidos", { aviso: "Selecione um pedido", pedido: result, logado, adm });
			});
		} else {
			const p = new Pedido();
			p.id = opcao;
			p.listarPorId(connection, function (result) {
				p.ticket = result[0].ticket;
				res.render("attticket", { aviso: "", logado, adm, pedido: p, acao: "Atualizar" });
			});
		}
	} else if (buttonClicked === "Excluir Pedido") {
		const opcao = req.body.checkbox;
		if (!opcao) {
			const p = new Pedido();
			p.usuario.cpf = req.session.login; //obter o cpf do usuario pelo login
			//listar os pedidos do usuario pelo cpf

			p.listarTodos(connection, function (result) {
				res.render("listapedidos", { aviso: "Selecione um pedido", pedido: result, logado, adm });
			});
		} else {
			const p = new Pedido();
			p.id = opcao;
			p.excluir(connection);
			p.listarTodos(connection, function (result) {
				res.render("listapedidos", { aviso: "", pedido: result, logado, adm });
			});
		}
	}
});

app.post("/filtrarListaPedidos", (req, res) => {
	const p = new Pedido();
	p.id = "%" + req.body.filtro + "%";
	p.filtrarPedido(connection, function (result) {
		res.render("listapedidos", { aviso: "", pedido: result, logado, adm });
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
				res.render("pagcartao", { aviso: "", pedidoId: novoID, logado, adm });
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
				res.render("pedidos", { aviso: "", pedido: result, logado, adm });
			});
		}
	} else {
		//nao logado
		res.redirect("/login");
	}
});

//alimentos
app.get("/alimentos", (req, res) => {
	if (req.session.login && adm) {
		const a = new Alimento();
		//listar todos os alimentos
		a.listar(connection, function (result) {
			res.render("alimentos", { aviso: "", alimento: result, logado, adm });
		});
	}
});
app.post("/alimentos", (req, res) => {
	const buttonClicked = req.body.button;
	if (buttonClicked === "Novo Alimento") {
		const a = new Alimento();
		res.render("addalimento", { aviso: "", alimento: a, acao: "Cadastrar", logado, adm });
	} else if (buttonClicked === "Atualizar Alimento") {
		let opcao = req.body.opcao;
		if (!opcao) {
			const a = new Alimento();
			//listar todos os alimentos
			a.listar(connection, function (result) {
				res.render("alimentos", { aviso: "Selecione um alimento", alimento: result, logado, adm });
			});
		} else {
			const a = new Alimento();
			a.id = opcao;
			id = opcao;
			a.listaEspecifica(connection, function (result) {
				a.nome = result[0].nome;
				a.unidade = result[0].unidade;
				a.valorNutricional = result[0].valor_nutricional;
				res.render("addalimento", { aviso: "", alimento: a, acao: "Atualizar", logado, adm });
			});
		}
	} else if (buttonClicked === "Excluir Alimento") {
		let opcao = req.body.opcao;
		if (!opcao) {
			const a = new Alimento();
			//listar todos os alimentos
			a.listar(connection, function (result) {
				res.render("alimentos", { aviso: "Selecione um alimento", alimento: result, logado, adm });
			});
		} else {
			const a = new Alimento();
			a.id = opcao;
			a.excluir(connection);
			a.listar(connection, function (result) {
				res.render("alimentos", { aviso: "", alimento: result, logado, adm });
			});
		}
	}
});

app.post("/filtrarAlimentos", (req, res) => {
	const a = new Alimento();
	a.nome = "%" + req.body.filtro + "%";
	a.filtrarAlimento(connection, function (result) {
		res.render("alimentos", { aviso: "", alimento: result, logado, adm });
	});
});

//addalimento

app.post("/addalimento", (req, res) => {
	const acao = req.body.button;
	if (acao == "Cadastrar") {
		const a = new Alimento();
		//obtençao dos dados
		a.nome = req.body.nome;
		a.unidade = req.body.unidade;
		a.valorNutricional = req.body.valornutri;
		//cadastrar
		a.cadastrar(connection);
		//carregar a pagina de sucesso
		res.render("sucesso", { aviso: "", logado, adm, mensagem: "Alimento cadastrado com sucesso!", link: "/alimentos" });
	} else {
		const a = new Alimento();
		a.id = id;
		a.nome = req.body.nome;
		a.unidade = req.body.unidade;
		a.valorNutricional = req.body.valornutri;
		a.atualizar(connection);
		res.render("sucesso", { aviso: "", logado, adm, mensagem: "Alimento atualizado com sucesso!", link: "/alimentos" });
	}
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
				res.render("restricoes", { aviso: "", restricoes: u.restricoes, lista: result, logado, adm });
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
//delrestricao
app.post("/delrestricao", (req, res) => {
	const r = new RestricaoAlimentar();
	const opcao = req.body.opcao;
	r.id = opcao;
	r.excluir(connection);
	const u = new Usuario();
	//listar as restrições do usuario
	u.restricao.listarEspecifica(connection, req.session.login, function (result) {
		u.restricoes = result; //armazenar as restrições
		//listar todas as restrições disponiveis
		u.restricao.listar(connection, function (result) {
			res.render("restricoes", { aviso: "", restricoes: u.restricoes, lista: result, logado, adm });
		});
	});
});
//listarestricoes
app.get("/listarestricoes", (req, res) => {
	if (req.session.login && adm) {
		const u = new Usuario();
		//listar todas as restricoes do banco
		u.restricao.listar(connection, function (result) {
			res.render("listarestricoes", { aviso: "", restricao: result, logado, adm });
		});
	}
});
app.post("/listarestricoes", (req, res) => {
	const buttonClicked = req.body.button;
	if (buttonClicked === "Nova Restrição") {
		const r = new RestricaoAlimentar();
		res.render("addrestricao", { aviso: "", acao: "Cadastrar", restricao: r, logado, adm });
	} else if (buttonClicked === "Atualizar Restrição") {
		const opcao = req.body.checkbox;
		if (!opcao) {
			const u = new Usuario();
			//listar todas as restricoes do banco
			u.restricao.listar(connection, function (result) {
				res.render("listarestricoes", { aviso: "Selecione uma restrição", restricao: result, logado, adm });
			});
		} else {
			const r = new RestricaoAlimentar();
			r.id = opcao;
			id = opcao;
			r.listaPorId(connection, function (result) {
				r.nome = result[0].nome_restricao;
				res.render("addrestricao", { aviso: "", acao: "Atualizar", restricao: r, logado, adm });
			});
		}
	} else if (buttonClicked === "Excluir Restrição") {
		const opcao = req.body.checkbox;
		if (!opcao) {
			const u = new Usuario();
			//listar todas as restricoes do banco
			u.restricao.listar(connection, function (result) {
				res.render("listarestricoes", { aviso: "Selecione uma restrição", restricao: result, logado, adm });
			});
		} else {
			const r = new RestricaoAlimentar();
			r.id = opcao;
			r.excluir(connection);
			const u = new Usuario();
			//listar todas as restricoes do banco
			r.listar(connection, function (result) {
				res.render("listarestricoes", { aviso: "", restricao: result, logado, adm });
			});
		}
	}
});

app.post("/filtrarRestricao", (req, res) => {
	const r = new RestricaoAlimentar();
	r.nome = "%" + req.body.filtro + "%";
	r.filtrarRestricao(connection, function (result) {
		res.render("listarestricoes", { aviso: "", restricao: result, logado, adm });
	});
});

//addrestricao
app.post("/addrestricao", (req, res) => {
	const acao = req.body.button;
	if (acao == "Cadastrar") {
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
					res.render("sucesso", { aviso: "", mensagem: "Restrição adcionada com sucesso!", link: "/listarestricoes", logado, adm });
				});
			}
		});
	} else {
		const r = new RestricaoAlimentar();
		//obtenção dos dados
		r.nome = req.body.nome;
		r.id = id;
		r.listar(connection, function (result) {
			const encontrou = result.some((item) => item.nome_restricao === r.nome); //variavel que verifica a presença da restrição no banco
			if (encontrou) {
				//se encontrou
				console.log("Já cadastrado"); //nao cadastre
			} else {
				//se nao encontrou
				//adicione a restrição
				r.atualizar(connection);
				res.render("sucesso", { aviso: "", mensagem: "Restrição atualizada com sucesso!", link: "/listarestricoes", logado, adm });
			}
		});
	}
});

//attcadastro
app.get("/attcadastro", (req, res) => {
	if (req.session.login) {
		const u = new Usuario();
		const c = new Curso();
		u.cpf = req.session.login;
		c.listar(connection, function (result1) {
			u.listarCredenciais(connection, function (result2) {
				res.render("attcadastro", { aviso: "", cursos: result1, usuario: result2[0], logado, link: "/perfil", adm });
			});
		});
	}
});

app.post("/attcadastro", (req, res) => {
	if (req.session.login) {
		const u = new Usuario();
		u.nome = req.body.nome;
		u.sobrenome = req.body.sobrenome;
		u.telefone = req.body.telefone;
		u.email = req.body.email;
		u.curso.id = req.body.curso;
		u.caracAlimenticia = req.body.escolha;
		u.cpf = req.body.cpf;
		u.perfil = req.body.isadm;
		u.atualizar(connection);
		res.render("sucesso", { aviso: "", mensagem: "Cadastro atualizado com sucesso!", link: "/perfil", logado, adm });
	}
});

//feedback
app.get("/feedback", (req, res) => {
	if (req.session.login) {
		const m = new Mensagem();
		res.render("feedback", { aviso: "", m: m, acao: "Enviar", logado, adm });
	} else {
		res.redirect("/login");
	}
});
app.post("/feedback", (req, res) => {
	const acao = req.body.acao;
	if (acao == "Enviar") {
		const u = new Usuario();
		u.cpf = req.session.login;
		u.mensagem.assunto = req.body.assunto;
		u.mensagem.mensagem = req.body.mensagem;
		u.listarCredenciais(connection, function (result) {
			u.curso.nome = result[0].curso_id_curso;
			u.mensagem.cadastrar(connection, u.cpf, u.curso.nome);
			res.render("sucesso", { aviso: "", mensagem: "Mensagem enviada", link: "/feedback", logado, adm });
		});
	} else {
		const m = new Mensagem();
		m.assunto = req.body.assunto;
		m.mensagem = req.body.mensagem;
		m.id = id;
		m.atualizar(connection);
		res.render("sucesso", { aviso: "", mensagem: "Mensagem atualizada", link: "/listafeedback", logado, adm });
	}
});

//listafeedback
app.get("/listafeedback", (req, res) => {
	if (req.session.login && adm) {
		const u = new Usuario();
		u.mensagem.listar(connection, function (result) {
			res.render("listafeedback", { aviso: "", mensgens: result, logado, adm });
		});
	}
});
app.post("/listafeedback", (req, res) => {
	const buttonClicked = req.body.button;
	if (buttonClicked === "Nova Mensagem") {
		res.redirect("/feedback");
	} else if (buttonClicked === "Atualizar Mensagem") {
		const opcao = req.body.checkbox;
		if (!opcao) {
			const u = new Usuario();
			u.mensagem.listar(connection, function (result) {
				res.render("listafeedback", { aviso: "Selecione uma mensagem", mensgens: result, logado, adm });
			});
		} else {
			const m = new Mensagem();
			m.id = opcao;
			id = opcao;
			m.listarPorId(connection, function (result) {
				m.assunto = result[0].assunto;
				m.mensagem = result[0].mensagem;
				res.render("feedback", { aviso: "", m: m, acao: "Atualizar", logado, adm });
			});
		}
	} else if (buttonClicked === "Excluir Mensagem") {
		const opcao = req.body.checkbox;
		if (!opcao) {
			const u = new Usuario();
			u.mensagem.listar(connection, function (result) {
				res.render("listafeedback", { aviso: "Selecione uma mensagem", mensgens: result, logado, adm });
			});
		} else {
			const m = new Mensagem();
			m.id = opcao;
			m.excluir(connection);
			m.listar(connection, function (result) {
				res.render("listafeedback", { aviso: "", mensgens: result, logado, adm });
			});
		}
	}
});

//ticket

app.get("/ticket", function (req, res) {
	if (req.session.login) {
		const p = new Pedido();
		p.usuario.cpf = req.session.login; //obter o cpf do usuario pelo login
		//listar os pedidos do usuario pelo cpf

		p.listarTicket(connection, function (result) {
			res.render("ticket", { aviso: "", pedido: result, logado, adm, aviso: "" });
		});
	} else {
		res.redirect("/login");
	}
});
app.post("/ticket", (req, res) => {
	const selecao = req.body.checkbox;
	if (selecao) {
		const p = new Pedido();
		p.usuario.cpf = req.session.login;
		p.id = selecao;
		p.listarPedido(connection, p.id, function (result) {
			res.render("viewticket", { aviso: "", pedido: result[0] });
		});
	} else {
		const p = new Pedido();
		p.usuario.cpf = req.session.login;
		p.listarTicket(connection, function (result) {
			res.render("ticket", { aviso: "", pedido: result, logado, adm, aviso: "Selecione um pedido" });
		});
	}
});

app.post("/attticket", (req, res) => {
	const p = new Pedido();
	p.id = req.body.numero;
	p.ticket = req.body.opcao;
	p.atualizarTicket(connection);
	res.render("sucesso", { aviso: "", mensagem: "Ticket atualizado", link: "/listapedido", logado, adm });
});

// a fazer

//attsenha
app.get("/attsenha", (req, res) => {
	if (req.session.login) {
		res.render("attsenha", { aviso: "", logado, adm });
	}
});
app.post("/attsenha", (req, res) => {
	const u = new Usuario();
	u.cpf = req.session.login;
	if (req.body.newsenha == req.body.rsenha) {
		u.senha = req.body.newsenha;
		u.atualizarSenha(connection);
		u.listarCredenciais(connection, function (result) {
			const credenciais = result[0];
			//listagem das restricoes do usuario
			u.restricao.listarEspecifica(connection, u.cpf, function (result) {
				res.render("perfil", { aviso: "", usuario: credenciais, restricoes: result, logado, adm });
			});
		});
	} else {
		res.render("attsenha", { aviso: "Senha diferentes", logado, adm });
	}
});

app.get("/a", function (req, res) {
	res.render("viewticket");
});
