'use client';
import { useState, useEffect } from 'react';
import { Header } from '../../components/header';
import './style.css';
import { useRouter, usePathname } from 'next/navigation';
export default function Home() {
  const router = useRouter();
  const params = usePathname();
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [email, setEmail] = useState('');
  const [telefone1, setTelefone1] = useState('');
  const [telefone2, setTelefone2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCnpjEditable, setIsCnpjEditable] = useState(false);
  
  
  let companyCnpj: string | null = null
  
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

  const formatarCNPJ = (input: string) => {
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
  const loadCompany = async (cnpj: string) => {
    const accessToken = localStorage.getItem('access_token');
    companyCnpj = params?.replace('/create-company/', '') ? params.replace('/create-company/', '') : null;
    if(companyCnpj && companyCnpj !== 'new'){
      try {
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
          setCnpj(formatarCNPJ(companyData.cnpj));
          setRazaoSocial(companyData.razao_social || '');
          setEmail(companyData.email || '');
          setTelefone1(formatarTelefone(companyData.telefone1) || '');
          setTelefone2(formatarTelefone(companyData.telefone2) || '');
        } else {
          setError('Erro ao carregar dados da empresa.');
        }
      } catch (error) {
        console.log('Erro na requisição:', error);
        setError('Erro ao carregar dados da empresa.');
      } finally {
        
      }
    }
  };
  async function saveCompany(){
    const data = {
      cnpj: cnpj.replace(/\D/g, ''), 
      razao_social: razaoSocial,
      email: email,
      telefone1: telefone1.replace(/\D/g, ''),
      telefone2: telefone2.replace(/\D/g, '') 
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
        console.log('Empresa criado com sucesso');
        router.push('/list-companies');
      } else {
        console.log('Erro ao atualizar empresa');
      }
    } catch (error) {
      console.log('Erro ao atualizar empresa');
    }
  }
  async function updateCompany(){
    const data = {
      razao_social: razaoSocial,
      email: email,
      telefone1: telefone1.replace(/\D/g, ''),
      telefone2: telefone2.replace(/\D/g, '') 
    };
    companyCnpj = params?.replace('/create-company/', '') ? params.replace('/create-company/', '') : null;
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
        console.log('Empresa editada com sucesso');
        router.push('/list-companies');
      } else {
        console.log('Erro ao atualizar empresa');
      }
    } catch (error) {
      console.log('Erro ao atualizar empresa');
    }
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    companyCnpj = params?.replace('/create-company/', '') ? params.replace('/create-company/', '') : null;
    if(companyCnpj && companyCnpj === 'new'){
      saveCompany(); 
    }else{
      updateCompany();
    }
    
  };

  useEffect(() => {
    loadCompany(cnpj);
  }, []);
  return (
    <div>
      <Header/>
      <div className="container-create">
        <div className="create-company">
          <h3>Empresa</h3>
          <form onSubmit={handleSubmit}>
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="cnpj">CNPJ</label>
                <input
                  type="text"
                  id="cnpj"
                  name="cnpj"
                  value={cnpj}
                  required
                  maxLength={18}
                  onChange={handleCnpjChange}
                  readOnly={isCnpjEditable}
                />
              </div>
              <div className="input-group">
                <label htmlFor="razao_social">Razão Social</label>
                <input
                  type="text"
                  id="razao_social"
                  name="razao_social"
                  value={razaoSocial}
                  required
                  onChange={(e) => setRazaoSocial(e.target.value)}
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
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="telefone1">Telefone 1</label>
                <input
                  type="tel"
                  id="telefone1"
                  name="telefone1"
                  value={telefone1}
                  required
                  maxLength={15}
                  onChange={handleTelefone1Change}
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="telefone2">Telefone 2 (opcional)</label>
                <input
                  type="tel"
                  id="telefone2"
                  name="telefone2"
                  value={telefone2}
                  maxLength={15}
                  onChange={handleTelefone2Change}
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="subBtn">Salvar Empresa</button>
            {error && <p className="error">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
