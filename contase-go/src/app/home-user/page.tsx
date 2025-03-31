'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import './home-user.css';
import { Header } from '../components/header';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

// Componente que redefine o CSS
const CSSReset = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'user-reset-styles';
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
      
      *[class^="login-"], *[class^="admin-"] {
        all: initial !important;
      }
    `;
    
    const oldStyle = document.getElementById('user-reset-styles');
    if (oldStyle) {
      oldStyle.remove();
    }
    
    document.head.appendChild(style);
    document.body.className = '';
    document.body.classList.add('user-body');
    
    return () => {
      if (document.getElementById('user-reset-styles')) {
        const styleElement = document.getElementById('user-reset-styles');
        if (styleElement) {
          styleElement.remove();
        }
      }
      document.body.classList.remove('user-body');
    };
  }, []);
  
  return null;
};

type Company = {
  cnpj: string;
  razao_social: string;
};

type Permission = {
  sigla: string;
  nome: string;
  descricao: string;
};

type DecodedToken = {
  cpf: string;
  nome: string;
  email: string;
  empresa: {
    cnpj: string;
    razao_social: string;
    email: string;
  };
  cargo: string;
  permissoes: Permission[];
};

const HomeUser = () => {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isChangingCompany, setIsChangingCompany] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const router = useRouter();

  function saveToken(token: any) {
    localStorage.setItem('access_token', token);
  }

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
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) return router.push('/login');

      // Decodificar o token para obter a empresa
      const decodedToken: DecodedToken = jwtDecode(accessToken);
      const tokenCompanyCnpj = decodedToken.empresa?.cnpj;

      const response = await fetch('http://localhost:3001/business/short', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data.data);

        if (data.data.length > 0) {
          // Definir a empresa do token como padrão ou a primeira da lista
          const defaultCompany = data.data.find((company: Company) => company.cnpj === tokenCompanyCnpj)?.cnpj || data.data[0].cnpj;
          setSelectedCompany(defaultCompany);
          await verifyPermissions(defaultCompany);
        }
      } else {
        console.log('Erro ao carregar empresas');
      }
    } catch (error) {
      console.log('Erro na requisição:', error);
    } finally {
      setIsInitialLoading(false);
      setTimeout(() => {
        setLoaded(true);
      }, 100);
    }
  }

  useEffect(() => {
    verifyToken();
    loadCompanies();
  }, []);

  async function changeCompany(cnpj: string) {
    try {
      setIsChangingCompany(true);
      const accessToken = localStorage.getItem('access_token');
      const data = { cnpj_empresa: cnpj };
      const response = await fetch('http://localhost:3001/auth/change-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const dataResponse = await response.json();
        saveToken(dataResponse.token);
        await verifyPermissions(cnpj);
      } else {
        console.log('Erro ao trocar empresa');
      }
    } catch (error) {
      console.log('Erro ao trocar empresa');
    } finally {
      setIsChangingCompany(false);
    }
  }

  async function verifyPermissions(cnpj: string) {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/other/permissions/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      } else {
        console.log('Erro ao verificar permissões');
      }
    } catch (error) {
      console.log('Erro ao verificar permissões');
    }
  }

  const handleCompanyChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCnpj = event.target.value;
    setSelectedCompany(newCnpj);
    await changeCompany(newCnpj);
  };

  if (isInitialLoading) {
    return (
      <div className="user-loading">
        <div className="user-loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <CSSReset />
      <Header />
      <div className="user-panel">
        <div className="user-panel-heading">
          <h1>Área do Usuário</h1>
        </div>
        
        <div className="user-company-selector">
          <select
            className="user-select"
            value={selectedCompany}
            onChange={handleCompanyChange}
            disabled={isChangingCompany}
          >
            {companies.map((company, index) => (
              <option key={index} value={company.cnpj}>
                {company.razao_social}
              </option>
            ))}
          </select>
          {isChangingCompany && <div className="user-select-loader"></div>}
        </div>
        
        <div className="user-panel-cards">
          {permissions.length > 0 ? (
            <>
              {(permissions.some(permission => permission.sigla === 'ADM') || 
               permissions.some(permission => permission.sigla === 'DF')) && (
                <div 
                  className={`user-panel-card ${loaded ? 'user-panel-card-visible' : ''}`}
                  onClick={() => router.push('/dashboard-financeiro')}
                >
                  <div className="user-panel-card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="20" x2="12" y2="10"></line>
                      <line x1="18" y1="20" x2="18" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="16"></line>
                      <path d="M2 20h20"></path>
                    </svg>
                  </div>
                  <h2 className="user-panel-card-title">Departamento Fiscal</h2>
                  <div className="user-panel-card-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              )}
              
              {(permissions.some(permission => permission.sigla === 'ADM') || 
               permissions.some(permission => permission.sigla === 'DP')) && (
                <div 
                  className={`user-panel-card ${loaded ? 'user-panel-card-visible' : ''}`}
                  onClick={() => router.push('/dashboard-pessoal')}
                  style={{ animationDelay: '0.1s' }}
                >
                  <div className="user-panel-card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <h2 className="user-panel-card-title">Departamento Pessoal</h2>
                  <div className="user-panel-card-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="user-panel-message">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>Você não possui permissões para acessar módulos nesta empresa.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HomeUser;