'use client';
import React, { useState, useEffect } from 'react';
import './style.css';
import { Header } from '../../components/header';
import { usePathname, useRouter } from 'next/navigation';
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

  let userCpf: string | null = null

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

async function loadUser() {
        const accessToken = localStorage.getItem('access_token');
        userCpf = params?.replace('/create-user/', '') ? params.replace('/create-user/', '') : null;

        if (userCpf && userCpf !== 'new') {
            
            const response = await fetch(`https://8351-177-184-217-182.ngrok-free.app/person/${userCpf}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'ngrok-skip-browser-warning': 'true', 
                }
            });
            
            const userDTO = await response.json();
            setIsCpfEditable(true);
            
            
            setCpf(formatarCPF(userCpf));
            setNome(userDTO.nome);
            setEmail(userDTO.email);
            setDataNascimento(userDTO.data_nascimento);
            setTelefone1(formatarTelefone(userDTO.telefone_principal));
            setTelefone2(userDTO.telefone_secundario);
          
        }
}
async function saveUser(){
  const userData = {
    cpf: cpf.replace(/\D/g, ''),
    nome,
    email,
    data_nascimento: dataNascimento || undefined, 
    telefone_principal: telefone1 || undefined,   
    telefone_secundario: telefone2 || undefined,  
    contratos: [], 
  };
  setIsLoading(true);
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/person/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userData),
    });

    router.push('/list-users');
  } catch (err) {
    setError('Ocorreu um erro ao enviar os dados. Tente novamente.');
    console.error('Erro:', err);
  } finally {
    setIsLoading(false);
    
  }
}
async function updateUser(){
  userCpf = params?.replace('/create-user/', '') ? params.replace('/create-user/', '') : null;
  const userData = {
    cpf: cpf.replace(/\D/g, ''),
    nome,
    email,
    data_nascimento: dataNascimento || undefined, 
    telefone_principal: telefone1 || undefined,   
    telefone_secundario: telefone2 || undefined,  
    contratos: [], 
  };

  setIsLoading(true);

  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch(`https://8351-177-184-217-182.ngrok-free.app/person/${userCpf}`, {
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

    const data = await response.json();
    router.push('/list-users');
    
  } catch (err) {
    setError('Ocorreu um erro ao enviar os dados. Tente novamente.');
    console.error('Erro:', err);
  } finally {
    setIsLoading(false);
    
  }
}
  const handleSubmit = async (e: React.FormEvent) => {
    userCpf = params?.replace('/create-user/', '') ? params.replace('/create-user/', '') : null;
    e.preventDefault();
    if(userCpf==='new'){
      saveUser();
    }else{
      updateUser();
    }
  };

  useEffect(() => {
    loadUser();
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
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={isLoading} className="subBtn">
            {isLoading ? 'Salvando usuário...' : 'Salvar Usuário'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
