'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link'; 
import './style.css';
import { Header } from '../components/header';
import { useRouter } from 'next/navigation';

const HomeAdmin = () => {
  const router = useRouter();
  /*async function verifyToken() {
    const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcGYiOiIxMjM0NTY3ODkwMSIsIm5vbWUiOiJBZG1pbmlzdHJhZG9yIFNpc3RlbWEiLCJlbWFpbCI6ImdiZ29pczE5OUBnbWFpbC5jb20iLCJlbXByZXNhIjp7ImNucGoiOiIxMjM0NTY3ODAwMDE5OSIsInJhemFvX3NvY2lhbCI6IkVtcHJlc2EgVGVzdGUgTFREQSIsImVtYWlsIjoiY29udGF0b0BlbXByZXNhdGVzdGUuY29tLmJyIn0sImNhcmdvIjoiQURTIiwicGVybWlzc29lcyI6W3sic2lnbGEiOiJBRE0iLCJub21lIjoiU3VwZXIgQWRtaW4ifSx7InNpZ2xhIjoiREYiLCJub21lIjoiRGVwYXJ0YW1lbnRvIEZpc2NhbCJ9LHsic2lnbGEiOiJEUCIsIm5vbWUiOiJEZXBhcnRhbWVudG8gcGVzc29hbCJ9XSwiaWF0IjoxNzMzNjg2MDg4LCJleHAiOjE3MzM2ODc4ODh9.pIvsdLoSSu2XELbAg969ymIow6qtZdFFJbsDvr5cK7s';
    const response = await fetch('https://3d33-177-184-217-182.ngrok-free.app/auth/validate-token', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
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
  }*/
    async function verifyToken() {
      const accessToken = localStorage.getItem('access_token');
  
      try {
          const response = await fetch('https://3d33-177-184-217-182.ngrok-free.app/auth/validate-token', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
                  'ngrok-skip-browser-warning': '69420'
              },
              mode: 'cors',
              credentials: 'include'
          });
  
          console.log('Response status:', response.status);
  
          if (response.ok) {
              const verifyToken = await response.json();
              console.log('Verify token:', verifyToken);
              return verifyToken;
          }
      } catch (error) {
          console.error('Error:', error);
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
