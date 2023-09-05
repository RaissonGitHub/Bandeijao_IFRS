module.exports = class Cardapio {
	constructor() {
		this.dia = "";
		this.imagem = "";
		this.tipo = "";
		this.descricao = "";
		this.valor = 0;
		//this.alimentos = []
	}

	listar(connection, dia, tipo) {
		const sql = "select * from cardapio where dia = ? and tipo = ?";
        function obterdia(dia){
            switch (dia){
                case 1: dia = 'segunda-feira'
            }
        }
		connection.query(sql, [dia,tipo], function (err, result) {
			if (err) throw err;
		});
	}
};
