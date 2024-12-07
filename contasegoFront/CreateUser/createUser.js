// Função para abrir a sidebar
function openNav() {
    document.getElementById("sidebar").style.width = "250px";
}

// Função para fechar a sidebar
function closeNav() {
    document.getElementById("sidebar").style.width = "0";
}

// Função para formatar o CPF
function formatarCPF(input) {
    let cpf = input.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    if (cpf.length > 11) {
        cpf = cpf.slice(0, 11); // Limita a 11 caracteres
    }
    if (cpf.length <= 11) {
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Adiciona ponto após os 3 primeiros dígitos
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Adiciona ponto após os 6 primeiros dígitos
        cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Adiciona hífen antes dos dois últimos dígitos
    }
    input.value = cpf;
}
// Função para limitar o número de caracteres dos telefones
function limitarTelefone(input) {
    let telefone = input.value.replace(/\D/g, '');
    if (telefone.length > 11) {
        telefone = telefone.slice(0, 11);
    }
    input.value = telefone;
}
