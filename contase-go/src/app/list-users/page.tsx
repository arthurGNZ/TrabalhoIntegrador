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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const togglePermissions = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  async function loadUsers() {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('https://50e5-177-184-217-182.ngrok-free.app/person', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      if (response.ok) {
         console.log(response);
         
      } else {
        console.error(`Erro ao carregar usuários: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  }
  

  useEffect(() => {
    setTimeout(() => {
      const fetchedUsers: User[] = [
        {
          id: "user1",
          name: "João Silva",
          email: "joao@exemplo.com",
          permissions: [
            { role: "Gerente", company: "GREMIO" },
            { role: "Supervisor", company: "FUTEBOL" },
          ],
        },
        {
          id: "user2",
          name: "Maria Oliveira",
          email: "maria@exemplo.com",
          permissions: [
            { role: "Administrador", company: "Naoseioqnaoseioqla" },
            { role: "Usuario", company: "Craque" },
          ],
        },
      ];
      setUsers(fetchedUsers);
    }, 1000); 
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
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  userId={user.id}
                  name={user.name}
                  email={user.email}
                  permissions={user.permissions}  
                  isExpanded={expandedUser === user.id}
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
