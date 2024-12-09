'use client';
import React, { useState, useEffect } from "react";
import UserRow from "../components/userRow";
import { Header } from "../components/header";
import "./style.css";  

type Permission = {
  role: string;
  company: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  permissions: Permission[];  
};

const ListarUsuarios = () => {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const togglePermissions = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  async function loadUsers() {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/person', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'  
        },
      });
  
      if (response.ok) {
         const data = await response.json();
         setUsers(data);
      } else {
        console.error("Erro ao carregar usuários:");
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  }
  const handleDelete = async (cpf: string) => {
    const confirmed = confirm(`Tem certeza que deseja excluir o usuário com CPF: ${cpf}? Esta operação não pode ser desfeita.`);
    if (confirmed) {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`https://8351-177-184-217-182.ngrok-free.app/person/${cpf}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (response.ok) {
          alert('Usuário excluído com sucesso!');
          setUsers(users.filter(user => user.id !== cpf));
        } else {
          console.error(`Erro ao excluir o usuário: ${response.status} - ${response.statusText}`);
          alert('Erro ao excluir o usuário.');
        }
      } catch (error) {
        console.error('Erro na requisição DELETE:', error);
        alert('Erro ao excluir o usuário.');
      }
    }
  };
  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="container">
      <Header/>
      <div className="content">
        <div className="list-users">
          <h3>Usuários Registrados</h3>
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Nome do Usuário</th>
                <th>E-mail</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <UserRow
                  key={user.id}
                  userId={user.id}
                  name={user.name}
                  email={user.email}
                  permissions={user.permissions}  
                  isExpanded={expandedUser === user.id}
                  onDelete={()=>handleDelete(user.id)}
                  onTogglePermissions={togglePermissions}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListarUsuarios;