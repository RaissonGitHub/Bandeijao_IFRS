// Codigo para inputs de alimento em addcardapio

let divInputCardapio = document.querySelector('.form-addcardapio-inputs-alimento');
let buttonAlimento = document.querySelector("#buttonAlimento")
let contador = 2

buttonAlimento.addEventListener('click', function(){
    // Crie um novo elemento label para Nome
    let labelNome = document.createElement('label');
    labelNome.setAttribute('for', `alimento${contador}nome`);
    labelNome.setAttribute('class', 'form-control-addcardapio-label-alimento')
    labelNome.textContent = `Alimento ${contador} Nome:`;

    // Crie um novo elemento input para Nome
    let inputNome = document.createElement('input');
    inputNome.setAttribute('type', 'text');
    inputNome.setAttribute('class', 'form-control-addcardapio-alimento');
    inputNome.setAttribute('name', `alimento${contador}nome`);
    inputNome.setAttribute('id', `alimento${contador}nome`);
    inputNome.setAttribute('placeholder', `Alimento ${contador} Nome:`);
    inputNome.setAttribute('required', 'true');

    // Crie um novo elemento label para Unidade

    let labelUnidade = document.createElement('label');
    labelUnidade.setAttribute('class', 'form-control-addcardapio-label-alimento')
    labelUnidade.setAttribute('for', `alimento${contador}unidade`);
    labelUnidade.textContent = `Alimento ${contador} Unidade:`;

    // Crie um novo elemento input para Unidade
    let inputUnidade = document.createElement('input');
    inputUnidade.setAttribute('type', 'text');
    inputUnidade.setAttribute('class', 'form-control-addcardapio-alimento');
    inputUnidade.setAttribute('name', `alimento${contador}unidade`);
    inputUnidade.setAttribute('id', `alimento${contador}unidade`);
    inputUnidade.setAttribute('placeholder', `Alimento ${contador} Unidade:`);
    inputUnidade.setAttribute('required', 'true');

    // Crie um novo elemento label para Valor Nutricional

    let labelValorNutri = document.createElement('label');
    labelValorNutri.setAttribute('for', `alimento${contador}valornutri`);
    labelValorNutri.setAttribute('class', 'form-control-addcardapio-label-alimento')
    labelValorNutri.textContent = `Alimento ${contador} Valor Nutricional:`;

    // Crie um novo elemento input para Valor Nutricional
    let inputValorNutri = document.createElement('input');
    inputValorNutri.setAttribute('type', 'text');
    inputValorNutri.setAttribute('class', 'form-control-addcardapio-alimento');
    inputValorNutri.setAttribute('name', `alimento${contador}valornutri`);
    inputValorNutri.setAttribute('id', `alimento${contador}valornutri`);
    inputValorNutri.setAttribute('placeholder', `Alimento ${contador} Valor Nutricional:`);

    // Adicione o label e o input à divInputCardapio
    divInputCardapio.appendChild(labelNome);
    divInputCardapio.appendChild(inputNome);
    divInputCardapio.appendChild(labelUnidade);
    divInputCardapio.appendChild(inputUnidade);
    divInputCardapio.appendChild(labelValorNutri);
    divInputCardapio.appendChild(inputValorNutri);

    contador++;
});

