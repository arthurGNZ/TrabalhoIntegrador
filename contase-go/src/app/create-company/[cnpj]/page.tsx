'use client';
import { useState, useEffect } from 'react';
import { Header } from '../../components/header';
import './create-company.css';
import { useRouter, usePathname } from 'next/navigation';

// Componente que redefine o CSS
const CSSReset = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'create-reset-styles';
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
      
      *[class^="login-"], *[class^="admin-"], *[class^="user-"], *[class^="list-"], *[class^="roles-"], *[class^="companies-"] {
        all: initial !important;
      }
    `;
    
    const oldStyle = document.getElementById('create-reset-styles');
    if (oldStyle) {
      oldStyle.remove();
    }
    
    document.head.appendChild(style);
    document.body.className = '';
    document.body.classList.add('create-body');
    
    return () => {
      if (document.getElementById('create-reset-styles')) {
        const resetStyles = document.getElementById('create-reset-styles');
        if (resetStyles) {
          resetStyles.remove();
        }
      }
      document.body.classList.remove('create-body');
    };
  }, []);
  
  return null;
};

export default function CreateCompany() {
  const router = useRouter();
  const params = usePathname();
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [email, setEmail] = useState('');
  const [telefone1, setTelefone1] = useState('');
  const [telefone2, setTelefone2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCnpjEditable, setIsCnpjEditable] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  let companyCnpj: string | null = null;

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
    
  const formatarCNPJ = (input: string) => {
    if (!input) return '';
    
    let formattedCnpj = input.replace(/\D/g, ''); 
    if (formattedCnpj.length > 14) {
      formattedCnpj = formattedCnpj.slice(0, 14); 
    }
    if (formattedCnpj.length <= 14) {
      formattedCnpj = formattedCnpj.replace(/^(\d{2})(\d)/, '$1.$2');
      formattedCnpj = formattedCnpj.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      formattedCnpj = formattedCnpj.replace(/\.(\d{3})(\d)/, '.$1/$2');
      formattedCnpj = formattedCnpj.replace(/(\d{4})(\d)/, '$1-$2');
    }
    return formattedCnpj;
  };

  const formatarTelefone = (input: string) => {
    if (!input) return '';
    
    let formattedTelefone = input.replace(/\D/g, ''); 
    if (formattedTelefone.length > 11) {
      formattedTelefone = formattedTelefone.slice(0, 11); 
    }
    if (formattedTelefone.length <= 11) {
      formattedTelefone = formattedTelefone.replace(/^(\d{2})(\d)/, '($1) $2');
      formattedTelefone = formattedTelefone.replace(/(\d{4})(\d)/, '$1-$2');
    }
    return formattedTelefone;
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCnpj = formatarCNPJ(e.target.value);
    setCnpj(formattedCnpj);
  };

  const handleTelefone1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedTelefone = formatarTelefone(e.target.value);
    setTelefone1(formattedTelefone);
  };

  const handleTelefone2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedTelefone = formatarTelefone(e.target.value);
    setTelefone2(formattedTelefone);
  };

  const loadCompany = async () => {
    companyCnpj = params?.replace('/create-company/', '') || null;
    
    if (companyCnpj && companyCnpj !== 'new') {
      setIsEditing(true);
      setIsLoading(true);
      
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:3001/business/${companyCnpj}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'ngrok-skip-browser-warning': 'true'  
          },
        });
  
        if (response.ok) {
          const companyDTO = await response.json();
          const companyData = companyDTO.data;
          setIsCnpjEditable(true);
          setCnpj(formatarCNPJ(companyData.cnpj || ''));
          setRazaoSocial(companyData.razao_social || '');
          setEmail(companyData.email || '');
          setTelefone1(companyData.telefone1 ? formatarTelefone(companyData.telefone1) : '');
          setTelefone2(companyData.telefone2 ? formatarTelefone(companyData.telefone2) : '');
        } else {
          setError('Erro ao carregar dados da empresa.');
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
        setError('Erro ao carregar dados da empresa.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  async function saveCompany() {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    const data = {
      cnpj: cnpj ? cnpj.replace(/\D/g, '') : '', 
      razao_social: razaoSocial,
      email: email,
      telefone1: telefone1 ? telefone1.replace(/\D/g, '') : '',
      telefone2: telefone2 ? telefone2.replace(/\D/g, '') : ''
    };

    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccess('Empresa criada com sucesso!');
        setTimeout(() => {
          router.push('/list-companies');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao criar empresa.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setError('Erro ao processar a requisição.');
    } finally {
      setIsLoading(false);
    }
  }

  async function updateCompany() {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    const data = {
      razao_social: razaoSocial,
      email: email,
      telefone1: telefone1 ? telefone1.replace(/\D/g, '') : '',
      telefone2: telefone2 ? telefone2.replace(/\D/g, '') : ''
    };
    
    companyCnpj = params?.replace('/create-company/', '') || null;
    
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3001/business/${companyCnpj}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccess('Empresa atualizada com sucesso!');
        setTimeout(() => {
          router.push('/list-companies');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao atualizar empresa.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setError('Erro ao processar a requisição.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    companyCnpj = params?.replace('/create-company/', '') || null;
    
    if (companyCnpj && companyCnpj === 'new') {
      saveCompany(); 
    } else {
      updateCompany();
    }
  };

  useEffect(() => {
    verifyToken();
    loadCompany();
  }, []);

  return (
    <>
      <CSSReset />
      <Header />
      <div className="create-container">
        <div className="create-panel">
          <div className="create-panel-heading">
            <h1>{isEditing ? 'Editar Empresa' : 'Nova Empresa'}</h1>
          </div>
          
          <div className="create-content-card">
            {isLoading && !error ? (
              <div className="create-loading">
                <div className="create-loading-spinner"></div>
                <p>Carregando...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="create-form">
                <div className="create-form-grid">
                  <div className="create-form-group">
                    <label htmlFor="cnpj" className="create-label">
                      CNPJ <span className="create-required">*</span>
                    </label>
                    <div className="create-input-wrapper">
                      <input
                        type="text"
                        id="cnpj"
                        name="cnpj"
                        value={cnpj}
                        required
                        maxLength={18}
                        onChange={handleCnpjChange}
                        readOnly={isCnpjEditable}
                        className={`create-input ${isCnpjEditable ? 'create-input-readonly' : ''}`}
                        placeholder="00.000.000/0000-00"
                      />
                      {isCnpjEditable && (
                        <div className="create-input-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="create-form-group">
                    <label htmlFor="razao_social" className="create-label">
                      Razão Social <span className="create-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="razao_social"
                      name="razao_social"
                      value={razaoSocial}
                      required
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      className="create-input"
                      placeholder="Razão Social da Empresa"
                    />
                  </div>
                  
                  <div className="create-form-group">
                    <label htmlFor="email" className="create-label">
                      E-mail <span className="create-required">*</span>
                    </label>
                    <div className="create-input-wrapper">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        className="create-input"
                        placeholder="email@empresa.com.br"
                      />
                      <div className="create-input-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="create-form-group">
                    <label htmlFor="telefone1" className="create-label">
                      Telefone Principal <span className="create-required">*</span>
                    </label>
                    <div className="create-input-wrapper">
                      <input
                        type="tel"
                        id="telefone1"
                        name="telefone1"
                        value={telefone1}
                        required
                        maxLength={15}
                        onChange={handleTelefone1Change}
                        className="create-input"
                        placeholder="(00) 0000-0000"
                      />
                      <div className="create-input-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="create-form-group">
                    <label htmlFor="telefone2" className="create-label">
                      Telefone Secundário
                    </label>
                    <div className="create-input-wrapper">
                      <input
                        type="tel"
                        id="telefone2"
                        name="telefone2"
                        value={telefone2}
                        maxLength={15}
                        onChange={handleTelefone2Change}
                        className="create-input"
                        placeholder="(00) 0000-0000"
                      />
                      <div className="create-input-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="create-message create-error">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                
                {success && (
                  <div className="create-message create-success">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>{success}</span>
                  </div>
                )}
                
                <div className="create-buttons">
                  <button 
                    type="button" 
                    className="create-button create-button-secondary"
                    onClick={() => router.push('/list-companies')}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="create-button create-button-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="create-button-spinner"></div>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <span>{isEditing ? 'Atualizar' : 'Salvar'}</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}