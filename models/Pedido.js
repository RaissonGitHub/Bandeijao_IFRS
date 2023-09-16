const Usuario = require("./Usuario");
module.exports = class Pedido {
	constructor() {
		this.dataEmissao = "";
		this.pagamento = "";
		this.observacao = "";
		this.usuario = new Usuario();
	}
	//listar todos os pedidos do banco
	listarTodos(connection, callback) {
		const sql = "select * from pedido";

		connection.query(sql, function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}
	//listar pedidos associados a um cpf
	listar(connection, callback) {
		const sql = "select * from pedido where usuario_cpf = ?";

		connection.query(sql, [this.usuario.cpf], function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}
	//lisar um pedido especifico com usuario especifico
	listarPedido(connection, id, callback) {
		const sql = "select * from pedido where id_pedido = ? AND usuario_cpf = ?";

		connection.query(sql, [id, this.usuario.cpf], function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}
	//fazer pedido
	fazerPedido(connection, id, callback) {
		const sql =
			"insert into pedido (data_emissao,pagamento,usuario_cpf,usuario_curso_id_curso,cardapio_id_cardapio,observacao) VALUES (NOW(),?,?,?,?,?)";
		connection.query(sql, [this.pagamento, this.usuario.cpf, this.usuario.curso.nome, id, this.observacao], function (err, result) {
			if (err) {
				throw err;
			} else {
				const novoID = result.insertId;
				callback(novoID); // Chama o callback com o novo ID
			}
		});
	}
	//pagar pedido
	pagarPedido(connection, id) {
		const sql = `UPDATE pedido
    SET pagamento = 'pago'
    WHERE id_pedido = ?;`;
		connection.query(sql, [id], function (err) {
			if (err) throw err;
		});
	}
};
