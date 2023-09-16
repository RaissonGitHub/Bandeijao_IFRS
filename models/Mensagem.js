module.exports = class Mensagem{
    constructor(){
        this.assunto = "";
        this.mensagem = "";
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
}