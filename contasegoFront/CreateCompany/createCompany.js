// Função para abrir a sidebar
function openNav() {
    document.getElementById("sidebar").style.width = "250px";
}

// Função para fechar a sidebar
function closeNav() {
    document.getElementById("sidebar").style.width = "0";
}


// Função para formatar o CNPJ
function formatarCNPJ(campo) {
    var cnpj = campo.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    
    // Aplica a formatação do CNPJ no padrão 00.623.904/0001-73
    if (cnpj.length <= 14) {
        cnpj = cnpj.replace(/^(\d{2})(\d)/, '$1.$2'); // Formata os primeiros 2 números
        cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3'); // Formata os próximos 3 números
        cnpj = cnpj.replace(/\.(\d{3})(\d)/, '.$1/$2'); // Coloca a barra no lugar correto
        cnpj = cnpj.replace(/(\d{4})(\d)/, '$1-$2'); // Formata a última parte
    }
    
    campo.value = cnpj;

}

// Função para limitar o número de caracteres dos telefones
function limitarTelefone(input) {
    let telefone = input.value.replace(/\D/g, ''); 
    if (telefone.length > 11) {
        telefone = telefone.slice(0, 11); 
    }
    input.value = telefone; 
}
