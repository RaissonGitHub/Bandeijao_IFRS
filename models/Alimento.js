module.exports = class Alimento {
    constructor() {
        this.nome = ""
        this.unidade = ""
        this.valorNutricional = ""
    }
    listar(connection,callback){
        const sql = "Select * from alimento";
        connection.query(sql,function(err, result){
            if (err) throw err;
			return callback(result);
		
        })
    }
    cadastrar(connection) {
        const sql = 'INSERT INTO alimento (nome,unidade,valor_nutricional) VALUES(?,?,?)'
        connection.query(sql, 
                       [this.nome, this.unidade, this.valorNutricional],
                       function (err, result) {
                         if (err) throw err;
                       }
         );
         
       }
}

