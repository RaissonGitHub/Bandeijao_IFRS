module.exports = class Alimento {
    constructor() {
        this.nome = ""
        this.unidade = ""
        this.valorNutricional = ""
    }
    //listar todas os alimentos do banco
    listar(connection,callback){
        const sql = "Select * from alimento";
        connection.query(sql,function(err, result){
            if (err) throw err;
			return callback(result);
		
        })
    }
    //cadastrar alimentos
    cadastrar(connection) {
        const sql = 'INSERT INTO alimento (nome,unidade,valor_nutricional) VALUES(?,?,?)'
        connection.query(sql, 
                       [this.nome, this.unidade, this.valorNutricional],
                       function (err, result) {
                         if (err) throw err;
                       }
         );
         
       }

       filtrarAlimento(connection,callback){
		const sql = 'SELECT * from alimento where nome like ?'
		connection.query(sql,[this.nome],function(err,result){
			if(err) throw err;
			return callback(result);
		})
	}
}

