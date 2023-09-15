class RestricaoAlimentar {
   constructor() {
       this.nome = "";
   }


   adicionar(connection){

   }

   listar(connection,callback){
    const sql = "SELECT * FROM restricao_alimentar"
    connection.query(sql,function(err,result){
        if(err) throw err;
        return callback(result)
    })
   }
}
