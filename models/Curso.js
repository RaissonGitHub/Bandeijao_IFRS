module.exports = class Curso {
	constructor() {
		this.nome = "";
		this.tempo = "";
		this.modalidade = "";
	}
	cadastrar(connection) {
		const sql = "INSERT INTO curso (nome,tempo,modalidade) VALUES(?,?,?)";
		connection.query(sql, [this.nome, this.tempo, this.modalidade], function (err, result) {
			if (err) throw err;
		});
	}
	listar(connection, callback) {
		const sql = "SELECT * FROM curso";
		connection.query(sql, function (err, result) {
			if (err) throw err;
			return callback(result);
		});
	}
};
