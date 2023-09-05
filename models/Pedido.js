module.exports = class Pedido {
    constructor() {
        this.dataEmissao = ""
        this.pagamento = ""
        //this.itens = []

    }
    listar(connection, callback){
        var sql = "select * from pedido";

        connection.query(sql, 
              function (err, result) {
                if (err) throw err;
                return  callback(result);
              }
        );
    }
    atualizar(){


    }
}
