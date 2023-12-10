module.exports = class Curso {
	constructor() {
		this.nome = "";
		this.tempo = "";
		this.modalidade = "";
		this.id = 0
	}
	//cadastrar curso
	cadastrar(connection) {
		const sql = "INSERT INTO curso (nome,tempo,modalidade) VALUES(?,?,?)";
		connection.query(sql, [this.nome, this.tempo, this.modalidade], function (err, result) {
			if (err) throw err;
		});
	}
	//listar curso
	listar(connection, callback) {
		const sql = "SELECT * FROM curso";
		connection.query(sql, function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}
	listarCurso(connection,callback){
		const sql = "SELECT * FROM curso where id_curso = ?";
		connection.query(sql, [this.id], function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}
	atualizar(connection){
		const sql = "update curso set nome =?, tempo = ?, modalidade=? where id_curso = ? "
		connection.query(sql, [this.nome,this.tempo,this.modalidade,this.id], function (err) {
			if (err) throw err;
			});
	}
	excluir(connection){
		const sql = `delete from curso where id_curso = ?`
		connection.query(sql,this.id,function(err){
			if(err) throw err;
		})
	}
	filtrarCurso(connection,callback){
		const sql = "select * from curso where nome like ? "
		connection.query(sql,this.nome,function(err,result){
			if(err) throw err;
			return callback(result)
		})
	}
};
