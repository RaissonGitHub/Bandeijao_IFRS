class RestricaoAlimentar {
   constructor() {
       this.nome = "";
   }

   listar(connection,callback){
    const sql = "SELECT * FROM restricao_alimentar"
    connection.query(sql,function(err,result){
        if(err) throw err;
        return callback(result)
    })
   }
   //se a restrição nao existir
   adicionar(connection){
        const sql = "INSERT INTO restricao_alimentar (nome_restricao) VALUES(?)"
        connection.query(sql,[this.nome],function(err){
            if(err) throw err;
        })
   }
   vincularRestricao(connection, id){
    const sql = 'INSERT INTO usuario_has_restricao_alimentar (usuario_cpf,usuario_curso_id_curso,restricao_alimentar_id_restricao) VALUES(?,?,?)'
   }

   
}
