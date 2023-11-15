const Curso = require("./Curso");
const Mensagem = require("./Mensagem");
const RestricaoAlimentar = require("./RestricaoAlimentar");

module.exports = class Usuario {
	constructor() {
		this.nome = "";
		this.sobrenome = "";
		this.matricula = "";
		this.cpf = "";
		this.telefone = "";
		this.email = "";
		this.caracAlimenticia = "";
		this.senha = "";
		this.curso = new Curso();
		this.mensagem = new Mensagem()
		this.restricao = new RestricaoAlimentar();
	}

	//listar informações dos usuarios e o nome de seu curso
	listar(connection, callback) {
		const sql =
			"SELECT u.cpf, u.nome, u.sobrenome, u.matricula, u.telefone, u.email, u.caracteristica_alimenticia, c.nome AS nome_curso FROM usuario AS u INNER JOIN curso AS c ON u.curso_id_curso = c.id_curso";

		connection.query(sql, [this.cpf], function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}

	//listar informações de um usuario especifico pelo cpf
	listarCredenciais(connection, callback) {
		const sql = `SELECT usuario.*, curso.nome AS nome_curso
		FROM usuario
		INNER JOIN curso ON usuario.curso_id_curso = curso.id_curso
		where cpf = ?`;
		connection.query(sql, [this.cpf], function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}

	//cadastrar um usuario
	cadastrar(connection) {
		const sql =
			"INSERT INTO usuario (cpf,nome,sobrenome,matricula,telefone,email,caracteristica_alimenticia,curso_id_curso,senha) VALUES(?,?,?,?,?,?,?,?,?)";
		connection.query(
			sql,
			[this.cpf, this.nome, this.sobrenome, this.matricula, this.telefone, this.email, this.caracAlimenticia, this.curso.nome, this.senha],
			function (err, result) {
				if (err) throw err;
			}
		);
	}

	//verificar se o cpf e a senha batem com os dados do banco
	verificarCredenciais(connection, cpf, senha, callback) {
		const query = "SELECT * FROM usuario WHERE cpf = ? AND senha = ?";
		connection.query(query, [cpf, senha], (error, results,perfil) => {
			if (error) {
				console.log(error);
				return callback(error, null);
			}

			// Verifica se um usuário com as credenciais fornecidas foi encontrado
			if (results.length === 1) {
				
				results[0].perfil == 'user'? perfil  = false: perfil  =true;
				return callback(null, results[0],perfil );
			} else {
				return callback("Credenciais inválidas", null);
			}
		});
	}

	filtrarUsuario(connection,callback){
		const sql = 'SELECT * from usuario where nome like ?'
		connection.query(sql,[this.nome],function(err,result){
			if(err) throw err;
			return callback(result);
		})
	}

	atualizar() {}
	deletar() {}
};
