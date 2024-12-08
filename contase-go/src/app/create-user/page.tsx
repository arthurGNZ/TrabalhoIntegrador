'use client';
import React, { useState } from 'react';
import './style.css';
import { Header } from '../components/header';

const CreateUser: React.FC = () => {
  
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone1, setTelefone1] = useState('');
  const [telefone2, setTelefone2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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


  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();

    const userData = {
      cpf,
      nome,
      email,
      dataNascimento,
      telefone1,
      telefone2
    };

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://sua-api.com/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar usuário');
      }

      const data = await response.json();
      console.log('Usuário criado com sucesso!', data);
      // Aqui você pode redirecionar ou mostrar uma mensagem de sucesso
    } catch (err) {
      setError('Ocorreu um erro ao enviar os dados. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="container-create">
        <Header/>
        <div className="create-user">
          <h3>Usuário</h3>
          <form onSubmit={submitForm}>
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
                  pattern="\d{3}(\.\d{3}){2}-\d{2}"
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
                  required
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
                  required
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
            <button type="submit" disabled={isLoading} className='subBtn'>
              {isLoading ? 'Criando...' : 'Criar Conta'}
            </button>
          </form>
        </div>
      </div>
  );
};

export default CreateUser;
