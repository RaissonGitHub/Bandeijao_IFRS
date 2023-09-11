const Alimento = require("./Alimento");

module.exports = class Cardapio {
	constructor() {
		this.dia = "";
		this.imagem = "";
		this.tipo = "";
		this.descricao = "";
		this.valor = 0;
		this.alimentos = [];
	}

	listar(connection, dia, tipo) {
		const sql = "select * from cardapio where dia = ? and tipo = ?";
		function obterdia(dia) {
			switch (dia) {
				case 1:
					dia = "segunda-feira";
					break;
				case 2:
					dia = "terça-feira";
					break;
				case 3:
					dia = "quarta-feira";
					break;
				case 4:
					dia = "quinta-feira";
					break;
				case 5:
					dia = "sexta-feira";
					break;
			}
		}
		connection.query(sql, [obterdia(dia), tipo], function (err, result) {
			if (err) throw err;
		});
	}

	inserir(connection) {
		const sql = "INSERT INTO cardapio (dia,imagem,tipo,descricao,valor) VALUES(?,?,?,?,?)";
		connection.query(sql, [this.dia, this.imagem, this.tipo, this.descricao, this.valor], function (err, result) {
			if (err) throw err;
		});
	}

	lista2(connection, callback) {
		const sql = `
		SELECT 
		  c.id_cardapio,
		  c.dia,
		  c.tipo,
		  c.descricao,
		  c.valor,
		  a.id_alimento,
		  a.nome AS nome_alimento,
		  a.unidade,
		  a.valor_nutricional
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

	addAlimento(alimento) {
		this.alimentos.push(alimento);
	}
};
