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

	listar(connection,callback) {
		const sql = "select * from cardapio";
		
		connection.query(sql, function (err, result) {
			if (err) throw err;
			return callback(result)
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

	inserirAlimentoNoCardapio(connection, alimento){
		const sql = "INSERT INTO cardapio_has_alimento (cardapio_id_cardapio,alimento_id_alimento) VALUES(?,?)"
		connection.query(sql,[this.id, alimento],function(err){
			if(err)throw err;
		})
	}
	listaEspecifica(connection,id,callback){
		const sql = "select * from cardapio where id_cardapio = ?"
		connection.query(sql,[id],function(err,result){
			if(err) throw err;
			return callback(result)
		})
	}
};
