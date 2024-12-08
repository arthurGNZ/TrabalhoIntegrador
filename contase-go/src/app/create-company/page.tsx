'use client';
import { useState } from 'react';
import { Header } from '../components/header';
import './style.css';

export default function Home() {
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [email, setEmail] = useState('');
  const [dataCriacao, setDataCriacao] = useState('');
  const [dataInicioContrato, setDataInicioContrato] = useState('');
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
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
                <label htmlFor="data_criacao">Data de Criação da Empresa</label>
                <input
                  type="date"
                  id="data_criacao"
                  name="data_criacao"
                  value={dataCriacao}
                  required
                  onChange={(e) => setDataCriacao(e.target.value)}
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="data_inicio_contrato">Data de Início de Contrato com a Contaseg</label>
                <input
                  type="date"
                  id="data_inicio_contrato"
                  name="data_inicio_contrato"
                  value={dataInicioContrato}
                  required
                  onChange={(e) => setDataInicioContrato(e.target.value)}
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
