"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./header-style.css"; 

interface Permissao {
  sigla: string;
  nome: string;
}

export const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);

  useEffect(() => {
    const permissoesStr = localStorage.getItem('permissoes');
    if (permissoesStr) {
      const perms = JSON.parse(permissoesStr) as Permissao[];
      setPermissoes(perms);
    }
  }, []);

  const hasAdminPermission = permissoes.some(perm => perm.sigla === 'ADM');

  const openNav = () => {
    setIsSidebarOpen(true);
  };

  const closeNav = () => {
    setIsSidebarOpen(false);
  };
  
  return (
    <>
      <div className="modern-header">
        <Link href="/" className="modern-header-logo">
          <img
            src="/logo-simbolo.png"
            alt="Logo da empresa Contaseg"
            className="modern-logo-img"
          />
          <div className="modern-title">
            <h1>ContaseGO</h1>
            <h2>Seus dados contabeis na palma da sua mão.</h2>
          </div>
        </Link>
        <div className="modern-menu-icon" onClick={openNav}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div className={`modern-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="modern-sidebar-header">
          <button className="modern-close-btn" onClick={closeNav}>
            &times;
          </button>
        </div>
        <div className="modern-sidebar-content">
          {
            hasAdminPermission ? (
              <>
                <Link href="/home-admin" className="modern-sidebar-link">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <span>Painel Administrativo</span>
                </Link>
                <Link href="/home-user" className="modern-sidebar-link">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>Área do Usuário</span>
                </Link>
                <Link href="/list-users" className="modern-sidebar-link">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>Usuários</span>
                </Link>
                <Link href="/list-companies" className="modern-sidebar-link">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22H5a2 2 0 0 1-2-2V9.5L9 4l6 5.5V7h2v3h2v2h-2v8a2 2 0 0 1-2 2h-3zm0 0V7" />
                  </svg>
                  <span>Empresas</span>
                </Link>
                <Link href="/list-roles" className="modern-sidebar-link">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  <span>Papéis</span>
                </Link>
              </>
            ) : (
              <Link href="/home-user" className="modern-sidebar-link">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Home</span>
              </Link>
            )
          }
        </div>
      </div>
      {isSidebarOpen && <div className="modern-overlay" onClick={closeNav}></div>}
    </>
  );
};

export default Header;