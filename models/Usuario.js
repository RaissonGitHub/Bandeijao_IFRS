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
    var sql = "SELECT u.cpf, u.nome, u.sobrenome, u.matricula, u.telefone, u.email, u.caracteristica_alimenticia, c.nome AS nome_curso FROM usuario AS u INNER JOIN curso AS c ON u.curso_id_curso = c.id_curso";

    connection.query(sql, [this.cpf],
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
