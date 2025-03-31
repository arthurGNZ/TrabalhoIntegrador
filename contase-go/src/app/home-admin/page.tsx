'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './admin-home.css';
import { Header } from '../components/header';

// Componente que redefine o CSS do documento
const CSSReset = () => {
  useEffect(() => {
    // Cria um estilo de reset que será adicionado à página
    const style = document.createElement('style');
    style.id = 'admin-reset-styles';
    style.innerHTML = `
      /* Reset completo para garantir que nenhum CSS anterior persista */
      body, html {
        margin: 0;
        padding: 0;
        font-family: 'Montserrat', sans-serif;
        background: linear-gradient(135deg, #e6f0ff, #f0f7ff);
        min-height: 100vh;
        overflow-x: hidden;
      }
      
      /* Reset de animações */
      * {
        animation: none !important;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      }
      
      /* Garantir que os estilos do login não interfiram */
      *[class^="login-"] {
        all: initial !important;
      }
    `;
    
    // Remover qualquer reset anterior que possa existir
    const oldStyle = document.getElementById('admin-reset-styles');
    if (oldStyle) {
      oldStyle.remove();
    }
    
    // Adiciona o novo estilo de reset
    document.head.appendChild(style);
    
    // Remover quaisquer classes do body
    document.body.className = '';
    document.body.classList.add('admin-body');
    
    // Cleanup function
    return () => {
      if (document.getElementById('admin-reset-styles')) {
        const resetStyles = document.getElementById('admin-reset-styles');
        if (resetStyles) {
          resetStyles.remove();
        }
      }
      document.body.classList.remove('admin-body');
    };
  }, []);
  
  return null;
};

const HomeAdmin = () => {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  
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
    // Verificar token de acesso
    verifyToken();
    
    // Limpar qualquer estilo inline que possa existir
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.hasAttribute('style')) {
        el.removeAttribute('style');
      }
    });
    
    // Trigger animation after component mounts and reset is done
    setTimeout(() => {
      setLoaded(true);
    }, 100);
  }, []);

  return (
    <>
      <CSSReset />
      <Header />
      <div className="admin-panel">
        <div className="admin-panel-heading">
          <h1>Painel Administrativo</h1>
        </div>
        
        <div className="admin-panel-cards">
          <div 
            className={`admin-panel-card ${loaded ? 'admin-panel-card-visible' : ''}`}
            onClick={() => router.push('/list-users')}
          >
            <div className="admin-panel-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h2 className="admin-panel-card-title">Usuários</h2>
            <div className="admin-panel-card-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
          
          <div 
            className={`admin-panel-card ${loaded ? 'admin-panel-card-visible' : ''}`}
            onClick={() => router.push('/list-companies')}
            style={{ animationDelay: '0.1s' }}
          >
            <div className="admin-panel-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <h2 className="admin-panel-card-title">Empresas</h2>
            <div className="admin-panel-card-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
          
          <div 
            className={`admin-panel-card ${loaded ? 'admin-panel-card-visible' : ''}`}
            onClick={() => router.push('/list-roles')}
            style={{ animationDelay: '0.2s' }}
          >
            <div className="admin-panel-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <h2 className="admin-panel-card-title">Papéis</h2>
            <div className="admin-panel-card-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeAdmin;