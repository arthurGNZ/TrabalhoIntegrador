'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CompanyRow from '../components/companyRow';
import './list-companies.css';
import { Header } from '../components/header';

// Componente que redefine o CSS
const CSSReset = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'companies-reset-styles';
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
      
      *[class^="login-"], *[class^="admin-"], *[class^="user-"], *[class^="list-"], *[class^="roles-"] {
        all: initial !important;
      }
    `;
    
    const oldStyle = document.getElementById('companies-reset-styles');
    if (oldStyle) {
      oldStyle.remove();
    }
    
    document.head.appendChild(style);
    document.body.className = '';
    document.body.classList.add('companies-body');
    
    return () => {
      if (document.getElementById('companies-reset-styles')) {
        document.getElementById('companies-reset-styles').remove();
      }
      document.body.classList.remove('companies-body');
    };
  }, []);
  
  return null;
};

type Company = {
  cnpj: string;
  razao_social: string;
  email: string;
  telefone1: string;
  telefone2: string;
  data_criacao: string;  
};

const ListCompanies = () => {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  async function loadCompanies() {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/business', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'  
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.data);
      } else {
        console.log(`Erro ao carregar empresa: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log('Erro na requisição:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async (companyCNPJ: string) => {
    const confirmed = confirm(`Tem certeza que deseja excluir esta empresa? (Essa ação é irreversível)`);
    if (confirmed) {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:3001/business/${companyCNPJ}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          setCompanies(companies.filter(company => company.cnpj !== companyCNPJ));
        } else {
          if(response.status === 500){
            alert("Não é possível excluir empresas com pessoas associadas");
          }
        }
      } catch (error) {
        console.log('Erro na requisição DELETE:', error);
      }
    }
  };

  useEffect(() => {
    verifyToken();
    loadCompanies();
  }, []);

  // Função para formatar CNPJ
  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <CSSReset />
      <Header />
      <div className="companies-container">
        <div className="companies-panel">
          <div className="companies-panel-heading">
            <h1>Administração de Empresas</h1>
          </div>
          
          <div className="companies-action-bar">
            <button 
              className="companies-add-button"
              onClick={() => router.push('/create-company/new')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              Adicionar Empresa
            </button>
          </div>
          
          <div className="companies-content-card">
            {isLoading ? (
              <div className="companies-loading">
                <div className="companies-loading-spinner"></div>
                <p>Carregando empresas...</p>
              </div>
            ) : (
              <div className="companies-table-container">
                <table className="companies-table">
                  <thead>
                    <tr>
                      <th>CNPJ</th>
                      <th>Razão Social</th>
                      <th>E-mail</th>
                      <th>Data de Criação</th>
                      <th>Telefone</th>
                      <th className="companies-column-actions">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.length > 0 ? (
                      companies.map((company) => (
                        <tr key={company.cnpj} className="companies-table-row">
                          <td>
                            <span className="companies-cnpj">{formatCNPJ(company.cnpj)}</span>
                          </td>
                          <td>{company.razao_social}</td>
                          <td>
                            <a href={`mailto:${company.email}`} className="companies-email">
                              {company.email}
                            </a>
                          </td>
                          <td>{formatDate(company.data_criacao)}</td>
                          <td>
                            <a href={`tel:${company.telefone1}`} className="companies-phone">
                              {company.telefone1}
                            </a>
                          </td>
                          <td className="companies-column-actions">
                            <button 
                              className="companies-button companies-edit-button"
                              onClick={() => router.push(`/create-company/${company.cnpj}`)}
                              title="Editar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                              </svg>
                            </button>
                            <button 
                              className="companies-button companies-delete-button"
                              onClick={() => handleDelete(company.cnpj)}
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
                        <td colSpan={6} className="companies-no-data">
                          Nenhuma empresa encontrada
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

export default ListCompanies;