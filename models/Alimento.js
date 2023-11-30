module.exports = class Alimento {
    constructor() {
        this.nome = ""
        this.unidade = ""
        this.valorNutricional = ""
        this.id = 0
    }
    //listar todas os alimentos do banco
    listar(connection,callback){
        const sql = "Select * from alimento";
        connection.query(sql,function(err, result){
            if (err) throw err;
			return callback(result);
		
        })
    }
    listaEspecifica(connection,callback){
        const sql = `Select * from alimento where id_alimento =?`
        connection.query(sql,[this.id],function(err,result){
            if(err) throw err;
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
    atualizar(connection){
        const sql = `update alimento set nome = ?,unidade=?,valor_nutricional=? where id_alimento =?`
        connection.query(sql,[this.nome,this.unidade,this.valorNutricional,this.id],function(err){
            if(err) throw err;
        })
    }
    excluir(connection){
        const sql ="delete from alimento where id_alimento = ?"
        connection.query(sql,[this.id],function(err){
            if(err) throw err;
        })
    }
}

