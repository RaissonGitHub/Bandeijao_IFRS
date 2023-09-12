const Usuario = require('./Usuario')
module.exports = class Pedido {
    constructor() {
        this.dataEmissao = ""
        this.pagamento = ""
        this.usuario = new Usuario();

    }
    listarTodos(connection, callback){
        var sql = "select * from pedido";

        connection.query(sql, 
              function (err, result) {
                if (err) throw err;
                return  callback(result);
              }
        );
    }
    listar(connection, callback){
        var sql = "select * from pedido where usuario_cpf = ?";

        connection.query(sql, [this.usuario.cpf],
              function (err, result) {
                if (err) throw err;
                return  callback(result);
              }
        );
    }
    atualizar(){


    }
}
