'use client';
import React, { useState } from 'react';
import './style.css';
import { Header } from '../components/header';

const CreateRole = () => {

  return (
    <div>
      <Header />
      <div className="container-create">
        <div className="create-role">
          <h3>Papel</h3>
          <form action="#" method="POST">
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="sigla_cargo">Sigla do Cargo</label>
                <input type="text" id="sigla_cargo" name="sigla_cargo" required />
              </div>
              <div className="input-group">
                <label htmlFor="nome_cargo">Nome do Cargo</label>
                <input type="text" id="nome_cargo" name="nome_cargo" required />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="sigla_permissao">Sigla da Permissão</label>
                <input type="text" id="sigla_permissao" name="sigla_permissao" required />
              </div>
              <div className="input-group">
                <label htmlFor="nome_permissao">Nome da Permissão</label>
                <input type="text" id="nome_permissao" name="nome_permissao" required />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="descricao_permissao">Descrição da Permissão</label>
                <textarea id="descricao_permissao" name="descricao_permissao" required></textarea>
              </div>
            </div>

            <button type="submit" className='subBtn'>Criar Papel</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRole;
