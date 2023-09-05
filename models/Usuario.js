const Curso = require('./Curso');

module.exports = class Usuario {
  constructor() {
      this.nome = "";
      this.sobrenome = "";
      this.matricula = "";
      this.cpf = "";
      this.telefone = "";
      this.email = "";
      this.caracAlimenticia = "";
      this.senha = "";
      this.curso = new Curso()
  }


  listar(connection, callback){
    var sql = "select * from usuario";

    connection.query(sql, 
          function (err, result) {
            if (err) throw err;
            return  callback(result);
          }
    );
}


  cadastrar(connection) {
   const sql = 'INSERT INTO usuario (cpf,nome,sobrenome,matricula,telefone,email,caracteristica_alimenticia,curso_id_curso,senha) VALUES(?,?,?,?,?,?,?,?,?)'
   connection.query(sql, 
                  [this.cpf, this.nome, this.sobrenome,this.matricula,this.telefone,this.email,this.caracAlimenticia,this.curso.nome,this.senha],
                  function (err, result) {
                    if (err) throw err;
                  }
    );
    
  }


  atualizar() {


  }
  deletar() {


  }
}
