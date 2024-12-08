'use client';
import React, { useState } from 'react';
import './style.css';
import { Header } from '../components/header';

const CreateRole = () => {
  const [siglaCargo, setSiglaCargo] = useState('');
  const [nomeCargo, setNomeCargo] = useState('');
  const [siglaPermissao, setSiglaPermissao] = useState('');
  const [nomePermissao, setNomePermissao] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const role = {
      sigla_cargo: siglaCargo,
      nome: nomeCargo,
      permissoes: [
        { sigla_permissao: siglaPermissao }
      ]
    };
  

    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('https://50e5-177-184-217-182.ngrok-free.app/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(role),
      });

      if (response.ok) {
        console.log('Papel criado com sucesso');
      } else {
        console.error('Erro ao criar role:', response.statusText);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };

  return (
    <div>
      <Header />
      <div className="container-create">
        <div className="create-role">
          <h3>Papel</h3>
          <form onSubmit={handleSubmit}>
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="sigla_cargo">Sigla do Cargo</label>
                <input
                  type="text"
                  id="sigla_cargo"
                  name="sigla_cargo"
                  value={siglaCargo}
                  onChange={(e) => setSiglaCargo(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="nome_cargo">Nome do Cargo</label>
                <input
                  type="text"
                  id="nome_cargo"
                  name="nome_cargo"
                  value={nomeCargo}
                  onChange={(e) => setNomeCargo(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="sigla_permissao">Sigla da Permissão</label>
                <input
                  type="text"
                  id="sigla_permissao"
                  name="sigla_permissao"
                  value={siglaPermissao}
                  onChange={(e) => setSiglaPermissao(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="subBtn">Criar Papel</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRole;
