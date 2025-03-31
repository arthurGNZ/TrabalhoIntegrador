'use client';
import React, { useState, useEffect } from 'react';
import './create-role.css';
import { Header } from '../../components/header';
import { usePathname, useRouter } from 'next/navigation';

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

const CreateRole = () => {
  const router = useRouter();
  const params = usePathname();
  const [siglaCargo, setSiglaCargo] = useState('');
  const [nomeCargo, setNomeCargo] = useState('');
  const [permissoes, setPermissoes] = useState<{ sigla: string, nome: string }[]>([]);
  const [selectedPermissoes, setSelectedPermissoes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSiglaEditable, setSiglaEditable] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  let sigla: string | null = null;

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

  async function loadRole() {
    sigla = params?.replace('/create-role/', '') || null;
    
    if (sigla && sigla !== 'new') {
      setIsEditing(true);
      setIsLoading(true);
      
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:3001/role/${sigla}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'ngrok-skip-browser-warning': 'true'  
          },
        });
        
        if (response.ok) {
          const roleTMP = await response.json();
          setSiglaEditable(true);
          const roleDTO = roleTMP.data;
          setSiglaCargo(roleDTO.sigla_cargo || '');
          setNomeCargo(roleDTO.nome || '');
          setSelectedPermissoes(roleDTO.permissoes.map((p: any) => p.sigla) || []); 
        } else {
          setError('Erro ao carregar os dados do papel.');
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
        setError('Erro ao carregar dados do papel.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsEditing(false);
    }
  }

  async function loadPermissions() {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/role/permissions/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'  
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPermissoes(data.data || []);
      } else {
        setError('Erro ao carregar permissões.');
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      setError('Erro ao carregar permissões.');
    }
  }

  async function saveRole() {
    const role = {
      sigla_cargo: siglaCargo,
      nome: nomeCargo,
      permissoes: selectedPermissoes.map(sigla => ({
        sigla_permissao: sigla
      }))
    };
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(role),
      });

      if (response.ok) {
        setSuccess('Papel criado com sucesso!');
        setTimeout(() => {
          router.push('/list-roles');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao criar papel');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setError('Ocorreu um erro ao criar o papel. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  async function updateRole() {
    const role = {
      sigla_cargo: siglaCargo,
      nome: nomeCargo,
      permissoes: selectedPermissoes.map(sigla => ({
        sigla_permissao: sigla
      }))
    };
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const accessToken = localStorage.getItem('access_token');
      sigla = params?.replace('/create-role/', '') || null;
      const response = await fetch(`http://localhost:3001/role/${sigla}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(role),
      });

      if (response.ok) {
        setSuccess('Papel atualizado com sucesso!');
        setTimeout(() => {
          router.push('/list-roles');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao atualizar papel');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setError('Ocorreu um erro ao atualizar o papel. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sigla = params?.replace('/create-role/', '') || null;
    
    if (sigla === 'new') {
      saveRole();
    } else {
      updateRole();
    }
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>, sigla: string) => {
    if (e.target.checked) {
      setSelectedPermissoes([...selectedPermissoes, sigla]);
    } else {
      setSelectedPermissoes(selectedPermissoes.filter((item) => item !== sigla));
    }
  };

  useEffect(() => {
    verifyToken();
    loadPermissions();
    loadRole();
  }, []);

  return (
    <>
      <CSSReset />
      <Header />
      <div className="create-container">
        <div className="create-panel">
          <div className="create-panel-heading">
            <h1>{isEditing ? 'Editar Papel' : 'Novo Papel'}</h1>
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
                    <label htmlFor="sigla_cargo" className="create-label">
                      Sigla do Cargo <span className="create-required">*</span>
                    </label>
                    <div className="create-input-wrapper">
                      <input
                        type="text"
                        id="sigla_cargo"
                        name="sigla_cargo"
                        value={siglaCargo}
                        required
                        onChange={(e) => setSiglaCargo(e.target.value)}
                        readOnly={isSiglaEditable}
                        className={`create-input ${isSiglaEditable ? 'create-input-readonly' : ''}`}
                        placeholder="Sigla (ex: ADM)"
                      />
                      {isSiglaEditable && (
                        <div className="create-input-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="create-form-group">
                    <label htmlFor="nome_cargo" className="create-label">
                      Nome do Cargo <span className="create-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="nome_cargo"
                      name="nome_cargo"
                      value={nomeCargo}
                      required
                      onChange={(e) => setNomeCargo(e.target.value)}
                      className="create-input"
                      placeholder="Nome do cargo (ex: Administrador)"
                    />
                  </div>
                </div>
                
                <div className="create-permissions-container">
                  <label className="create-label">
                    Permissões <span className="create-required">*</span>
                  </label>
                  <div className="create-permissions-grid">
                    {permissoes.map((permissao) => (
                      <div key={permissao.sigla} className="create-permission-item">
                        <input
                          type="checkbox"
                          id={`permissao-${permissao.sigla}`}
                          value={permissao.sigla}
                          checked={selectedPermissoes.includes(permissao.sigla)}
                          onChange={(e) => handlePermissionChange(e, permissao.sigla)}
                          className="create-checkbox"
                        />
                        <label htmlFor={`permissao-${permissao.sigla}`} className="create-checkbox-label">
                          {permissao.nome}
                        </label>
                      </div>
                    ))}
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
                    onClick={() => router.push('/list-roles')}
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
};

export default CreateRole;