module.exports = class Cardapio {
	constructor() {
		this.dia = "";
		this.imagem = "";
		this.tipo = "";
		this.descricao = "";
		this.valor = 0;
	}

	listar(connection, dia, tipo) {
		const sql = "select * from cardapio where dia = ? and tipo = ?";
        function obterdia(dia){
            switch (dia){
                case 1: dia = 'segunda-feira'
				break;
                case 2: dia = 'terça-feira'
				break;
                case 3: dia = 'quarta-feira'
				break;
                case 4: dia = 'quinta-feira'
				break;
                case 5: dia = 'sexta-feira'
				break;
            }
        }
		connection.query(sql, [obterdia(dia),tipo], function (err, result) {
			if (err) throw err;
		});
	}
};
