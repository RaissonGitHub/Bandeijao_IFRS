module.exports = class RestricaoAlimentar {
	constructor() {
		this.nome = "";
		this.id =0
	}
	//listar todas as restrições do banco
	listar(connection, callback) {
		const sql = "SELECT * FROM restricao_alimentar";
		connection.query(sql, function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}
	//listar todas as restrições de um usuario especifco
	listarEspecifica(connection, id, callback) {
		const sql = `select *,nome_restricao from usuario_has_restricao_alimentar inner join restricao_alimentar
    on restricao_alimentar_id_restricao = restricao_alimentar.id_restricao
    where usuario_cpf = ?;`;
		connection.query(sql, id, function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}
	//adicionar restricoes
	adicionar(connection,callback) {
		const sql = "INSERT INTO restricao_alimentar (nome_restricao) VALUES(?)";
		connection.query(sql, [this.nome], function (err,result) {
			if (err) throw err;
            return callback(result)
		});
	}
	//vincular restricoes a um usuario especifico
	vincularRestricao(connection, id,curso,id_restricao) {
		const sql = "INSERT IGNORE INTO usuario_has_restricao_alimentar (usuario_cpf,usuario_curso_id_curso,restricao_alimentar_id_restricao) VALUES(?,?,?)";
		
		connection.query(sql,[id,curso,id_restricao],function(err){
            if(err) throw err;
        });
	}
	filtrarRestricao(connection,callback){
		const sql = 'SELECT * from restricao_alimentar where nome_restricao like ?'
		connection.query(sql,[this.nome],function(err,result){
			if(err) throw err;
			return callback(result);
		})
	}
	listaPorId(connection,callback){
		const sql = `Select * from restricao_alimentar where id_restricao = ?`
		connection.query(sql,[this.id],function(err,result){
			if(err) throw err;
			return callback(result);
		})
	}
	excluir(connection){
		const sql = `delete from restricao_alimentar where id_restricao = ?`
		connection.query(sql,[this.id],function(err){
			if(err) throw err;
		})
	}
	atualizar(connection){
		const sql = `update restricao_alimentar set nome_restricao = ? where id_restricao = ?`
		connection.query(sql,[this.nome,this.id],function(err){
			if(err) throw err;
		})
	}
};
