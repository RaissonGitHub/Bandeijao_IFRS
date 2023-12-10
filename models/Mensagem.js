module.exports = class Mensagem{
    constructor(){
        this.id = 0
        this.assunto = "";
        this.mensagem = "";
    }
    filtrarMensagem(connection,callback){
        const sql = 'SELECT * FROM mensagem where id_mensagem like ?'
        connection.query(sql,this.id,function(err,result){
            if (err) throw err;
            return callback(result)
        })
    }
    listar(connection,callback){
        const sql = 'SELECT * FROM mensagem'
        connection.query(sql,function(err,result){
            if (err) throw err;
            return callback(result)
        })
    }
    cadastrar(connection,id,curso){
        const sql = 'INSERT INTO mensagem (assunto,mensagem,usuario_cpf,usuario_curso_id_curso) VALUES (?,?,?,?)'
        connection.query(sql,[this.assunto,this.mensagem,id,curso],function(err){
            if(err) throw err;
        })
    }
    listarPorId(connection,callback){
        const sql = "Select * from mensagem where id_mensagem =?"
        connection.query(sql,[this.id],function (err,result){
            if(err) throw err;
            return callback(result)
        })
    }
    atualizar(connection){
        const sql = `update mensagem set assunto = ?, mensagem =? where id_mensagem = ?`
        connection.query(sql,[this.assunto,this.mensagem,this.id],function(err){
            if(err) throw err;
        })
    }
    excluir(connection){
        const sql = `delete from mensagem where id_mensagem = ?`
        connection.query(sql,[this.id],function(err){
            if(err) throw err;
        })
    }
}