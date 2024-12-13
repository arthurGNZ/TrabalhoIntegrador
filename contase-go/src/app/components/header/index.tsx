"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./style.css"; 

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
      <div className="header-container">
        <Link href="/" className="logo-styleDoLink">
          <img
            src="/logo-simbolo.png"
            alt="Logo da empresa Contaseg"
            className="logo"
          />
          <div className="title">
            <h1>CONTASEG</h1>
            <h2>CONTABILIDADE E SEGUROS</h2>
          </div>
        </Link>
        <div className="menu-icon" onClick={openNav}>
          &#9776;
        </div>
      </div>
      <div className={`sidebar-header ${isSidebarOpen ? "open" : ""}`}>
        <button className="closebtn-header" onClick={closeNav}>
          &times;
        </button>
        {
          hasAdminPermission ? (
            <>
              <Link href="/home-admin">Home Administrador</Link>
              <Link href="/home-user">Home Usuario</Link>
              <Link href="/list-users">Ver Usuários</Link>
              <Link href="/list-companies">Ver Empresas</Link>
              <Link href="/list-roles">Ver Papéis</Link>
            </>
          ) : (
            <Link href="/home-user">Home</Link>
          )
        }
      </div>
    </>
  );
};