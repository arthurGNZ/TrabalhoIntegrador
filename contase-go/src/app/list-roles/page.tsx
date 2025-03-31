'use client';
import React, { useState, useEffect } from 'react';
import RoleRow from '../components/roleRow';
import './list-roles.css'; 
import { Header } from '../components/header';
import { useRouter } from 'next/navigation';

// Componente que redefine o CSS
const CSSReset = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'roles-reset-styles';
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
      
      *[class^="login-"], *[class^="admin-"], *[class^="user-"], *[class^="list-"] {
        all: initial !important;
      }
    `;
    
    const oldStyle = document.getElementById('roles-reset-styles');
    if (oldStyle) {
      oldStyle.remove();
    }
    
    document.head.appendChild(style);
    document.body.className = '';
    document.body.classList.add('roles-body');
    
    return () => {
      if (document.getElementById('roles-reset-styles')) {
        document.getElementById('roles-reset-styles').remove();
      }
      document.body.classList.remove('roles-body');
    };
  }, []);
  
  return null;
};

type Permission = {
  sigla: string;
  nome: string;
};

type Role = {
  sigla_cargo: string;
  nome: string;
  permissoes: Permission[];
};

const ListarRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  async function verifyToken() {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch('http://localhost:3001/auth/validate-token', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'ngrok-skip-browser-warning': 'true'  
          }
    });
    if (response.ok) {
      const verifyToken = await response.json();
      if (!verifyToken.valid) {
        router.push('/login');
      }
    }
  }

  const handleDelete = async (roleSigla: string) => {
    const confirmed = window.confirm(`Tem certeza que deseja excluir este papel? Esta operação não pode ser desfeita.`);
    if (confirmed) {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:3001/role/${roleSigla}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          alert('Papel excluído com sucesso!');
          setRoles(roles.filter(role => role.sigla_cargo !== roleSigla));
        } else {
          console.log(`Erro ao excluir o papel: ${response.status} - ${response.statusText}`);
          alert('Erro ao excluir o papel.');
        }
      } catch (error) {
        console.log('Erro na requisição DELETE:', error);
        alert('Erro ao excluir o papel.');
      }
    }
  };


  async function loadRoles() {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/role', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'  
        },
      });
  
      if (response.ok) {
         const data = await response.json();
         setRoles(data.data);
      } else {
        console.log(`Erro ao carregar papéis: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log('Erro na requisição:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  useEffect(() => {
    verifyToken();
    loadRoles();
  }, []);

  return (
    <>
      <CSSReset />
      <Header />
      <div className="roles-container">
        <div className="roles-panel">
          <div className="roles-panel-heading">
            <h1>Administração de Papéis</h1>
          </div>
          
          <div className="roles-action-bar">
            <button 
              className="roles-add-button"
              onClick={() => router.push('/create-role/new')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              Adicionar Papel
            </button>
          </div>
          
          <div className="roles-content-card">
            {isLoading ? (
              <div className="roles-loading">
                <div className="roles-loading-spinner"></div>
                <p>Carregando papéis...</p>
              </div>
            ) : (
              <div className="roles-table-container">
                <table className="roles-table">
                  <thead>
                    <tr>
                      <th>Nome do Papel</th>
                      <th>Sigla</th>
                      <th>Permissões</th>
                      <th className="roles-column-actions">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <tr key={role.sigla_cargo} className="roles-table-row">
                          <td>{role.nome}</td>
                          <td>
                            <span className="roles-badge">{role.sigla_cargo}</span>
                          </td>
                          <td>
                            <div className="roles-permissions">
                              {role.permissoes.slice(0, 3).map((permission, index) => (
                                <span key={index} className="roles-permission-badge">
                                  {permission.sigla}
                                </span>
                              ))}
                              {role.permissoes.length > 3 && (
                                <span className="roles-more-badge">
                                  +{role.permissoes.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="roles-column-actions">
                            <button 
                              className="roles-button roles-edit-button"
                              onClick={() => router.push(`/create-role/${role.sigla_cargo}`)}
                              title="Editar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                              </svg>
                            </button>
                            <button 
                              className="roles-button roles-delete-button"
                              onClick={() => handleDelete(role.sigla_cargo)}
                              title="Excluir"
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="roles-no-data">
                          Nenhum papel encontrado
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

export default ListarRoles;