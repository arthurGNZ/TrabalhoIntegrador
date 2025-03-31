'use client';
import React, { useState, useEffect } from 'react';
import './create-user.css';
import { Header } from '../../components/header';
import { usePathname, useRouter } from 'next/navigation';

interface Company {
  cnpj: string;
  razao_social: string;
}

interface Role {
  sigla_cargo: string;
  nome: string;
}

interface Contract {
  empresa: {
    cnpj: string;
    razao_social: string;
  };
  cargo: {
    sigla: string;
    nome: string;
  };
}

interface ValidationError {
  type: 'contract';
  index: number;
  message: string;
}

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

const CreateUser = () => {
  const router = useRouter();
  const params = usePathname();
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone1, setTelefone1] = useState('');
  const [telefone2, setTelefone2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCpfEditable, setIsCpfEditable] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [contratos, setContratos] = useState<Contract[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  
  let userCpf: string | null = null;

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

  const formatarCPF = (input: string) => {
    if (!input) return '';
    
    let formattedCpf = input.replace(/\D/g, '');
    if (formattedCpf.length > 11) {
      formattedCpf = formattedCpf.slice(0, 11);
    }
    if (formattedCpf.length <= 11) {
      formattedCpf = formattedCpf.replace(/(\d{3})(\d)/, '$1.$2');
      formattedCpf = formattedCpf.replace(/(\d{3})(\d)/, '$1.$2');
      formattedCpf = formattedCpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return formattedCpf;
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

  const validateContracts = () => {
    const errors: ValidationError[] = [];
    contratos.forEach((contrato, index) => {
      if (!contrato.empresa.cnpj || !contrato.cargo.sigla) {
        errors.push({
          type: 'contract',
          index,
          message: 'Preencha empresa e cargo ou remova o contrato'
        });
      }
    });
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const addContract = () => {
    const newContract = {
      empresa: {
        cnpj: '',
        razao_social: ''
      },
      cargo: {
        sigla: '',
        nome: ''
      }
    };
    setContratos([...contratos, newContract]);
  };

  const removeContract = (index: number) => {
    const updatedContracts = contratos.filter((_, i) => i !== index);
    setContratos(updatedContracts);
    setValidationErrors(validationErrors.filter(error => error.index !== index));
  };

  const updateContractCompany = (index: number, company: Company) => {
    const updatedContracts = [...contratos];
    updatedContracts[index].empresa = {
      cnpj: company.cnpj,
      razao_social: company.razao_social
    };
    setContratos(updatedContracts);
  };

  const updateContractRole = (index: number, role: Role) => {
    const updatedContracts = [...contratos];
    updatedContracts[index].cargo = {
      sigla: role.sigla_cargo,
      nome: role.nome
    };
    setContratos(updatedContracts);
  };

  async function loadUser() {
    userCpf = params?.replace('/create-user/', '') || null;
    
    if (userCpf && userCpf !== 'new') {
      setIsEditing(true);
      setIsLoading(true);
      
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:3001/person/${userCpf}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'ngrok-skip-browser-warning': 'true',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userDTO = await response.json();
        setIsCpfEditable(true);

        setCpf(formatarCPF(userCpf));
        setNome(userDTO.nome || '');
        setEmail(userDTO.email || '');
        setDataNascimento(userDTO.data_nascimento || '');
        setTelefone1(userDTO.telefone_principal ? formatarTelefone(userDTO.telefone_principal) : '');
        setTelefone2(userDTO.telefone_secundario ? formatarTelefone(userDTO.telefone_secundario) : '');

        if (Array.isArray(userDTO.contratos)) {
          const formattedContracts = userDTO.contratos.map((contrato: any) => ({
            empresa: {
              cnpj: contrato.empresa.cnpj,
              razao_social: contrato.empresa.razao_social
            },
            cargo: {
              sigla: contrato.cargo.sigla,
              nome: contrato.cargo.nome
            }
          }));
          setContratos(formattedContracts);
        } else {
          setContratos([]);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Erro ao carregar dados do usuário');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsEditing(false);
    }
  }

  async function loadCompaniesAndRoles() {
    try {
      const accessToken = localStorage.getItem('access_token');
      const [companyResponse, roleResponse] = await Promise.all([
        fetch('http://localhost:3001/business/short', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'ngrok-skip-browser-warning': 'true'
          },
        }),
        fetch('http://localhost:3001/role', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'ngrok-skip-browser-warning': 'true'
          },
        })
      ]);

      if (!companyResponse.ok || !roleResponse.ok) {
        throw new Error('Failed to load companies or roles');
      }

      const companiesData = await companyResponse.json();
      const rolesData = await roleResponse.json();

      setCompanies(companiesData.data || []);
      setRoles(rolesData.data || []);
    } catch (err) {
      console.error('Erro ao carregar empresas ou cargos:', err);
      setError('Erro ao carregar empresas ou cargos.');
    }
  }

  async function saveUser() {
    const userData = {
      cpf: cpf.replace(/\D/g, ''),
      nome,
      email,
      data_nascimento: dataNascimento || undefined,
      telefone_principal: telefone1 ? telefone1.replace(/\D/g, '') : undefined,
      telefone_secundario: telefone2 ? telefone2.replace(/\D/g, '') : undefined,
      contratos
    };

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/person/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save user');
      }

      setSuccess('Usuário criado com sucesso!');
      setTimeout(() => {
        router.push('/list-users');
      }, 1500);
    } catch (err: any) {
      console.error('Erro:', err);
      setError(err.message || 'Ocorreu um erro ao enviar os dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  async function updateUser() {
    userCpf = params?.replace('/create-user/', '') || null;
    const userData = {
      cpf: cpf.replace(/\D/g, ''),
      nome,
      email,
      data_nascimento: dataNascimento || undefined,
      telefone_principal: telefone1 ? telefone1.replace(/\D/g, '') : undefined,
      telefone_secundario: telefone2 ? telefone2.replace(/\D/g, '') : undefined,
      contratos
    };

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3001/person/${userCpf}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      setSuccess('Usuário atualizado com sucesso!');
      setTimeout(() => {
        router.push('/list-users');
      }, 1500);
    } catch (err: any) {
      console.error('Erro:', err);
      setError(err.message || 'Ocorreu um erro ao atualizar os dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateContracts()) {
      return;
    }

    userCpf = params?.replace('/create-user/', '') || null;
    
    if (userCpf === 'new') {
      await saveUser();
    } else {
      await updateUser();
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCpf = formatarCPF(e.target.value);
    setCpf(formattedCpf);
  };

  const handleTelefone1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedTelefone = formatarTelefone(e.target.value);
    setTelefone1(formattedTelefone);
  };

  const handleTelefone2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedTelefone = formatarTelefone(e.target.value);
    setTelefone2(formattedTelefone);
  };

  useEffect(() => {
    verifyToken();
    loadUser();
    loadCompaniesAndRoles();
  }, []);

  return (
    <>
      <CSSReset />
      <Header />
      <div className="create-container">
        <div className="create-panel">
          <div className="create-panel-heading">
            <h1>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</h1>
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
                    <label htmlFor="cpf" className="create-label">
                      CPF <span className="create-required">*</span>
                    </label>
                    <div className="create-input-wrapper">
                      <input
                        type="text"
                        id="cpf"
                        name="cpf"
                        value={cpf}
                        required
                        maxLength={14}
                        onChange={handleCpfChange}
                        readOnly={isCpfEditable}
                        className={`create-input ${isCpfEditable ? 'create-input-readonly' : ''}`}
                        placeholder="000.000.000-00"
                      />
                      {isCpfEditable && (
                        <div className="create-input-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="create-form-group">
                    <label htmlFor="nome" className="create-label">
                      Nome Completo <span className="create-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={nome}
                      required
                      onChange={(e) => setNome(e.target.value)}
                      className="create-input"
                      placeholder="Nome completo do usuário"
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
                        placeholder="email@exemplo.com"
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
                    <label htmlFor="dataNascimento" className="create-label">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      id="dataNascimento"
                      name="dataNascimento"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      className="create-input"
                    />
                  </div>
                  
                  <div className="create-form-group">
                    <label htmlFor="telefone1" className="create-label">
                      Telefone Principal
                    </label>
                    <div className="create-input-wrapper">
                      <input
                        type="tel"
                        id="telefone1"
                        name="telefone1"
                        value={telefone1}
                        maxLength={15}
                        onChange={handleTelefone1Change}
                        className="create-input"
                        placeholder="(00) 00000-0000"
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
                        placeholder="(00) 00000-0000"
                      />
                      <div className="create-input-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="create-contracts-section">
                  <label className="create-label create-contracts-label">
                    Contratos
                  </label>
                  
                  <div className="create-contracts-container">
                    {contratos.length === 0 ? (
                      <div className="create-no-contracts">
                        <p>Nenhum contrato adicionado</p>
                      </div>
                    ) : (
                      contratos.map((contrato, index) => (
                        <div key={index} className="create-contract-item">
                          <div className="create-contract-inputs">
                            <div className="create-contract-field">
                              <label className="create-label">Empresa</label>
                              <select
                                value={contrato.empresa.cnpj}
                                onChange={(e) => {
                                  const company = companies.find(c => c.cnpj === e.target.value);
                                  if (company) updateContractCompany(index, company);
                                }}
                                className="create-select"
                              >
                                <option value="">Selecione a empresa</option>
                                {companies.map((company) => (
                                  <option key={company.cnpj} value={company.cnpj}>
                                    {company.razao_social}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="create-contract-field">
                              <label className="create-label">Cargo</label>
                              <select
                                value={contrato.cargo.sigla}
                                onChange={(e) => {
                                  const role = roles.find(r => r.sigla_cargo === e.target.value);
                                  if (role) updateContractRole(index, role);
                                }}
                                className="create-select"
                              >
                                <option value="">Selecione o cargo</option>
                                {roles.map((role) => (
                                  <option key={role.sigla_cargo} value={role.sigla_cargo}>
                                    {role.nome}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => removeContract(index)}
                            className="create-remove-contract-btn"
                            aria-label="Remover contrato"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                    
                    {validationErrors.map((error, index) => (
                      <div key={index} className="create-validation-error">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>{error.message}</span>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addContract}
                      className="create-add-contract-btn"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      <span>Adicionar Contrato</span>
                    </button>
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
                    onClick={() => router.push('/list-users')}
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

export default CreateUser;