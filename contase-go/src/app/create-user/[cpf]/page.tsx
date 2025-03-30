'use client';
import React, { useState, useEffect } from 'react';
import './style.css';
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
  const [isCpfEditable, setIsCpfEditable] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [contratos, setContratos] = useState<Contract[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
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
    

  useEffect(() => {
    verifyToken();
  },[]);

  let userCpf: string | null = null;


  const formatarCPF = (input: string) => {
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
    let telefone = input.replace(/\D/g, '');
    if (telefone.length > 11) {
      telefone = telefone.slice(0, 11);
    }
    return telefone;
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
    const accessToken = localStorage.getItem('access_token');
    userCpf = params?.replace('/create-user/', '') ? params.replace('/create-user/', '') : null;

    if (userCpf && userCpf !== 'new') {
      try {
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
        setNome(userDTO.nome);
        setEmail(userDTO.email);
        setDataNascimento(userDTO.data_nascimento);
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
      } catch (err: any) {
        console.error('Error loading user:', err.message);
        setError('Erro ao carregar dados do usuário');
      }
    }
  }

  async function loadCompaniesAndRoles() {
    const accessToken = localStorage.getItem('access_token');
    try {
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

      setCompanies(companiesData.data);
      setRoles(rolesData.data);
    } catch (err) {
      setError('Erro ao carregar empresas ou cargos.');
      console.error('Erro ao carregar empresas ou cargos:', err);
    }
  }

  async function saveUser() {
    const userData = {
      cpf: cpf.replace(/\D/g, ''),
      nome,
      email,
      data_nascimento: dataNascimento || undefined,
      telefone_principal: telefone1 || undefined,
      telefone_secundario: telefone2 || undefined,
      contratos
    };

    setIsLoading(true);
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
        throw new Error('Failed to save user');
      }

      router.push('/list-users');
    } catch (err) {
      setError('Ocorreu um erro ao enviar os dados. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateUser() {
    userCpf = params?.replace('/create-user/', '') ? params.replace('/create-user/', '') : null;
    const userData = {
      cpf: cpf.replace(/\D/g, ''),
      nome,
      email,
      data_nascimento: dataNascimento || undefined,
      telefone_principal: telefone1 || undefined,
      telefone_secundario: telefone2 || undefined,
      contratos
    };

    setIsLoading(true);

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
        const errorText = await response.text();
        throw new Error(`Erro: ${response.status} - ${errorText}`);
      }

      router.push('/list-users');
    } catch (err) {
      setError('Ocorreu um erro ao enviar os dados. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateContracts()) {
      return;
    }

    userCpf = params?.replace('/create-user/', '') ? params.replace('/create-user/', '') : null;
    
    if (userCpf === 'new') {
      await saveUser();
    } else {
      await updateUser();
    }
  };

  useEffect(() => {
    loadUser();
    loadCompaniesAndRoles();
  }, []);

  return (
    <div className="container-create">
      <Header />
      <div className="create-user">
        <h3>Usuário</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="cpf">CPF</label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={cpf}
                onChange={(e) => setCpf(formatarCPF(e.target.value))}
                required
                maxLength={14}
                readOnly={isCpfEditable}
              />
            </div>
            <div className="input-group">
              <label htmlFor="nome">Nome Completo</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="data_nascimento">Data de Nascimento</label>
              <input
                type="date"
                id="data_nascimento"
                name="data_nascimento"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="telefone1">Telefone 1</label>
              <input
                type="tel"
                id="telefone1"
                name="telefone1"
                value={telefone1}
                onChange={(e) => setTelefone1(formatarTelefone(e.target.value))}
                maxLength={11}
              />
            </div>
            <div className="input-group">
              <label htmlFor="telefone2">Telefone 2 (opcional)</label>
              <input
                type="tel"
                id="telefone2"
                name="telefone2"
                value={telefone2}
                onChange={(e) => setTelefone2(formatarTelefone(e.target.value))}
                maxLength={11}
              />
            </div>
          </div>

          <div className="input-row" style={{ marginTop: '1rem' }}>
            <div className="input-group" style={{ width: '100%' }}>
              <label style={{ 
                fontSize: '1rem',
                fontWeight: '500',
                color: 'white',
                marginBottom: '1rem',
                display: 'block'
              }}>
                Contratos:
              </label>

              {contratos.map((contrato, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '1rem',
                  alignItems: 'flex-end'
                }}>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      color: '#666'
                    }}>
                      Empresa
                    </label>
                    <select
                      value={contrato.empresa.cnpj}
                      onChange={(e) => {
                        const company = companies.find(c => c.cnpj === e.target.value);
                        if (company) updateContractCompany(index, company);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ced4da',
                        color: contrato.empresa.cnpj ? '#333' : '#999'
                      }}
                    >
                      <option value="">Selecione a empresa</option>
                      {companies.map((company) => (
                        <option key={company.cnpj} value={company.cnpj}>
{company.razao_social}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      color: '#666'
                    }}>
                      Cargo
                    </label>
                    <select
                      value={contrato.cargo.sigla}
                      onChange={(e) => {
                        const role = roles.find(r => r.sigla_cargo === e.target.value);
                        if (role) updateContractRole(index, role);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ced4da',
                        color: contrato.cargo.sigla ? '#333' : '#999'
                      }}
                    >
                      <option value="">Selecione o cargo</option>
                      {roles.map((role) => (
                        <option key={role.sigla_cargo} value={role.sigla_cargo}>
                          {role.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeContract(index)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      width: '32px',
                      height: '32px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      padding: 0
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}

              {validationErrors.map((error, index) => (
                <div key={index} style={{
                  color: '#dc3545',
                  fontSize: '0.875rem',
                  marginTop: '0.25rem'
                }}>
                  {error.message}
                </div>
              ))}

              <div style={{
                display: 'flex',
                justifyContent: contratos.length === 0 ? 'center' : 'flex-start',
                marginTop: '1rem'
              }}>
                <button
                  type="button"
                  onClick={addContract}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    padding: 0
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div style={{
              color: '#dc3545',
              marginTop: '1rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0d6efd',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              marginTop: '1.5rem'
            }}
          >
            {isLoading ? 'Salvando usuário...' : 'Salvar Usuário'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;