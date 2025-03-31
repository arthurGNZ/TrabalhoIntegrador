'use client';
import React, { useState, useEffect } from "react";
import Head from 'next/head';
import UserRow from "../components/userRow";
import { Header } from "../components/header";
import "./list-users.css";
import { useRouter } from 'next/navigation';

// Componente que redefine o CSS
const CSSReset = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'list-reset-styles';
    style.innerHTML = `
      body, html {
        margin: 0;
        padding: 0;
        font-family: 'Montserrat', sans-serif;
        background: linear-gradient(135deg, #e6f0ff, #f0f7ff);
        min-height: 100vh;
        overflow-x: hidden;
      }
      
      * {
        animation: none !important;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      }
      
      *[class^="login-"], *[class^="admin-"], *[class^="user-"] {
        all: initial !important;
      }
    `;
    
    const oldStyle = document.getElementById('list-reset-styles');
    if (oldStyle) {
      oldStyle.remove();
    }
    
    document.head.appendChild(style);
    document.body.className = '';
    document.body.classList.add('list-body');
    
    return () => {
      if (document.getElementById('list-reset-styles')) {
        document.getElementById('list-reset-styles').remove();
      }
      document.body.classList.remove('list-body');
    };
  }, []);
  
  return null;
};

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
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function verifyToken() {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch('http://localhost:3001/auth/validate-token', {
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

  const togglePermissions = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  async function loadUsers() {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/person', {
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
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    verifyToken();
    loadUsers();
  }, []);

  const handleDelete = async (cpf: string) => {
    const confirmed = confirm(`Tem certeza que deseja excluir o usuário com CPF: ${cpf}? Esta operação não pode ser desfeita.`);
    if (confirmed) {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:3001/person/${cpf}`, {
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
      <CSSReset />
      <Header />
      <div className="list-container">
        <div className="list-panel">
          <div className="list-panel-heading">
            <h1>Administração de Usuários</h1>
          </div>
          
          <div className="list-action-bar">
            <button 
              className="list-add-button"
              onClick={() => router.push('/create-user/new')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              Adicionar Usuário
            </button>
          </div>
          
          <div className="list-content-card">
            {isLoading ? (
              <div className="list-loading">
                <div className="list-loading-spinner"></div>
                <p>Carregando usuários...</p>
              </div>
            ) : (
              <div className="list-table-container">
                <table className="list-table">
                  <thead>
                    <tr>
                      <th className="list-column-small"></th>
                      <th>Nome do Usuário</th>
                      <th>E-mail</th>
                      <th className="list-column-actions">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <React.Fragment key={user.id}>
                          <tr className="list-table-row">
                            <td className="list-column-small">
                              <button 
                                className="list-expand-button"
                                onClick={() => togglePermissions(user.id)}
                              >
                                {expandedUser === user.id ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="18 15 12 9 6 15"></polyline>
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                  </svg>
                                )}
                              </button>
                            </td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td className="list-column-actions">
                              <button 
                                className="list-button list-edit-button"
                                onClick={() => router.push(`/create-user/${user.id}`)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 20h9"></path>
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                              </button>
                              <button 
                                className="list-button list-delete-button"
                                onClick={() => handleDelete(user.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                              </button>
                            </td>
                          </tr>
                          {expandedUser === user.id && (
                            <tr className="list-permissions-row">
                              <td colSpan={4}>
                                <div className="list-permissions-container">
                                  <h3>Permissões do Usuário</h3>
                                  <table className="list-permissions-table">
                                    <thead>
                                      <tr>
                                        <th>Papel</th>
                                        <th>Empresa</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {user.permissions.length > 0 ? (
                                        user.permissions.map((permission, index) => (
                                          <tr key={index}>
                                            <td>{permission.role}</td>
                                            <td>{permission.company}</td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan={2}>Nenhuma permissão encontrada</td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="list-no-data">
                          Nenhum usuário encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ListarUsuarios;