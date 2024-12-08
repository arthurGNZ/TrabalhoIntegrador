'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link'; 
import './style.css';
import { Header } from '../components/header';
import { useRouter } from 'next/navigation';

const HomeAdmin = () => {
  const router = useRouter();
  async function verifyToken() {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/auth/validate-token', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'ngrok-skip-browser-warning': 'true'  
          }
    });
    if (response.ok) {
      console.log(response);
      const verifyToken = await response.json();
      console.log(verifyToken);
    //if (verifyToken.ok) {
    //  if(verifyToken.valid){
  //     router.push('/');
    //  }
    //}
    }
  }
    

  useEffect(() => {
    verifyToken();
  },[]);

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
