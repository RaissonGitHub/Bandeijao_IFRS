const Alimento = require("./Alimento");

module.exports = class Cardapio {
	constructor() {
		this.dia = "";
		this.imagem = "";
		this.tipo = "";
		this.descricao = "";
		this.valor = 0;
		this.alimentos = [];
		this.id = 0;
		this.alimento = new Alimento();
	}

	//listar todos os cardapios do banco
	listar(connection, callback) {
		const sql = "select * from cardapio";

		connection.query(sql, function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}

	//inserir cardapios no banco
	inserir(connection) {
		const sql = "INSERT INTO cardapio (dia,imagem,tipo,descricao,valor) VALUES(?,?,?,?,?)";
		connection.query(sql, [this.dia, this.imagem, this.tipo, this.descricao, this.valor], function (err, result) {
			if (err) throw err;
		});
	}

	//listar cardapios e seus alimentos associados
	listarCardapioseAlimentos(connection, callback) {
		const sql = `
		SELECT c.id_cardapio, c.dia, c.tipo, c.imagem, c.descricao, c.valor,
		  a.id_alimento, a.nome AS nome_alimento, a.unidade, a.valor_nutricional
		FROM	
		  cardapio AS c	
		LEFT JOIN
		  cardapio_has_alimento AS cha ON c.id_cardapio = cha.cardapio_id_cardapio
		LEFT JOIN
		  alimento AS a ON cha.alimento_id_alimento = a.id_alimento
	  `;
		connection.query(sql, function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}

	//vincular alimentos a um cardapio
	inserirAlimentoNoCardapio(connection, alimento) {
		const sql = "INSERT INTO cardapio_has_alimento (cardapio_id_cardapio,alimento_id_alimento) VALUES(?,?)";
		connection.query(sql, [this.id, alimento], function (err) {
			if (err) throw err;
		});
	}
	desvincularAlimentoNoCarpio(connection, alimento) {
		const sql = `Delete from cardapio_has_alimento where cardapio_id_cardapio = ? and alimento_id_alimento=?`;
		connection.query(sql, [this.id, alimento], function (err) {
			if (err) throw err;
		});
	}
	//listar um cardapio especifico e seus alimentos associados
	listaEspecifica(connection, callback) {
		const sql = `SELECT cardapio.*, alimento.*
		FROM cardapio
		LEFT JOIN cardapio_has_alimento ON cardapio.id_cardapio = cardapio_has_alimento.cardapio_id_cardapio
		LEFT JOIN alimento ON cardapio_has_alimento.alimento_id_alimento = alimento.id_alimento
		WHERE cardapio.id_cardapio = ?;
	  `;
		connection.query(sql, [this.id], function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}
	atualizar(connection) {
		const sql = `update cardapio set dia = ?,imagem = ?,tipo=?,descricao=?,valor=? where id_cardapio =?`;
		connection.query(sql, [this.dia, this.imagem, this.tipo, this.descricao, this.valor, this.id], function (err) {
			if (err) throw err;
		});
	}
	excluir(connection) {
		const sql = "Delete from cardapio where id_cardapio=?";
		connection.query(sql, [this.id], function (err) {
			if (err) throw err;
		});
	}
	filtrarCardapio(connection, callback) {
		const sql = `SELECT c.id_cardapio, c.dia, c.tipo, c.imagem, c.descricao, c.valor,
				  a.id_alimento, a.nome AS nome_alimento, a.unidade, a.valor_nutricional
				FROM	
				  cardapio AS c	
				LEFT JOIN
				  cardapio_has_alimento AS cha ON c.id_cardapio = cha.cardapio_id_cardapio
				LEFT JOIN
				  alimento AS a ON cha.alimento_id_alimento = a.id_alimento
				  where id_cardapio like ?;`;
		connection.query(sql, this.id, function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}

	listarPeloDia(connection, day, callback) {
		switch (day) {
			case 0:
				this.dia = "segunda-feira";
				break;
			case 1:
				this.dia = "segunda-feira";
				break;
			case 2:
				this.dia = "terça-feira";
				break;
			case 3:
				this.dia = "quarta-feira";
				break;
			case 4:
				this.dia = "quinta-feira";
				break;
			case 5:
				this.dia = "sexta-feira";
				break;
			case 6:
				this.dia = "segunda-feira";
				break;
			default:
				this.dia = "Dia inválido";
		}
		const sql = "select * from cardapio where dia = ?";
		connection.query(sql, this.dia, function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}
};
