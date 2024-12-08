import React from 'react';
import Link from 'next/link'; 
import './style.css';
import { Header } from '../components/header';
const HomeAdmin = () => {
  return (
    <>
      <Header/>
      <div className="container-home">
        <div className="infoBanner">
          <p>O que deseja fazer?</p>
        </div>
        <div className="selectionBox">
          <div className="buttons">
            <Link href="/create-user" className="button">Criar Usuário</Link>
            <Link href="/list-users" className="button">Listar Usuários</Link>
          </div>
          <div className="buttons">
            <Link href="/create-company" className="button">Criar Empresa</Link>
            <Link href="/list-companies" className="button">Listar Empresas</Link>
          </div>
          <div className="buttons">
            <Link href="/create-role" className="button">Criar Papel</Link>
            <Link href="/list-roles" className="button">Listar Papéis</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeAdmin;
