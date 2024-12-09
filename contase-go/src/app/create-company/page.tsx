'use client';
import { useState } from 'react';
import { Header } from '../components/header';
import './style.css';
import { useRouter } from 'next/navigation';
export default function Home() {
  const router = useRouter();
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [email, setEmail] = useState('');
  const [telefone1, setTelefone1] = useState('');
  const [telefone2, setTelefone2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const data = {
      cnpj: cnpj.replace(/\D/g, ''), 
      razao_social: razaoSocial,
      email: email,
      telefone1: telefone1.replace(/\D/g, ''),
      telefone2: telefone2.replace(/\D/g, '') 
    };

    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Empresa criado com sucesso');
        router.push('/home-admin');
      } else {
        console.error('Erro ao criar empresa:', response.statusText);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };


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

            <button type="submit" disabled={isLoading} className="subBtn">
              {isLoading ? 'Criando...' : 'Criar Empresa'}
            </button>
            {error && <p className="error">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
