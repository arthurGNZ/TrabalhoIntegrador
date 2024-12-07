// Função para abrir a sidebar
function openNav() {
    document.getElementById("sidebar").style.width = "250px";
}

// Função para fechar a sidebar
function closeNav() {
    document.getElementById("sidebar").style.width = "0";
}

// Função para alternar a visibilidade das permissões
function togglePermissions(roleId) {
    var permissionsText = document.getElementById(roleId);
    var arrow = permissionsText.previousElementSibling.firstElementChild;
    
    if (permissionsText.style.display === "table-row") {
        permissionsText.style.display = "none";
        arrow.innerHTML = "&#9654;";
    } else {
        permissionsText.style.display = "table-row";
        arrow.innerHTML = "&#9660;";
    }
}
