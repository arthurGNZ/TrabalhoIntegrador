'use client';
import React, { useState, useEffect } from "react";
import Head from 'next/head'; // Importando Head
import UserRow from "../components/userRow";
import { Header } from "../components/header";
import "./style.css";
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  async function verifyToken() {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/auth/validate-token', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'ngrok-skip-browser-warning': 'true',
      }
    });
    if (response.ok) {
      const verifyToken = await response.json();
      if (!verifyToken.valid) {
        router.push('/login');
      }
    }
  }

  useEffect(() => {
    verifyToken();
  }, []);

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
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.log("Erro ao carregar usuários:");
      }
    } catch (error) {
      console.log('Erro na requisição:', error);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);
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
  return (
    <>
      <Head>
        <title>Listar Usuários</title> 
      </Head>
      <div className="container">
        <Header />
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
                    isExpanded={user.id === expandedUser}
                    onDelete={() => handleDelete(user.id)}
                    onTogglePermissions={togglePermissions}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListarUsuarios;
