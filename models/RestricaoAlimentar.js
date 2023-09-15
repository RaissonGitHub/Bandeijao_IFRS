module.exports = class RestricaoAlimentar {
	constructor() {
		this.nome = "";
	}

	listar(connection, callback) {
		const sql = "SELECT * FROM restricao_alimentar";
		connection.query(sql, function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}
	listarEspecifica(connection, id, callback) {
		const sql = `select *,nome_restricao from usuario_has_restricao_alimentar inner join restricao_alimentar
    on restricao_alimentar_id_restricao = restricao_alimentar.id_restricao
    where usuario_cpf = ?;`;
		connection.query(sql, id, function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}
	//se a restrição nao existir
	adicionar(connection,callback) {
		const sql = "INSERT INTO restricao_alimentar (nome_restricao) VALUES(?)";
		connection.query(sql, [this.nome], function (err,result) {
			if (err) throw err;
            return callback(result)
		});
	}
	vincularRestricao(connection, id,curso,id_restricao) {
		const sql = "INSERT INTO usuario_has_restricao_alimentar (usuario_cpf,usuario_curso_id_curso,restricao_alimentar_id_restricao) VALUES(?,?,?)";
		connection.query(sql,[id,curso,id_restricao],function(err){
            if(err) throw err;
        });
	}
};
