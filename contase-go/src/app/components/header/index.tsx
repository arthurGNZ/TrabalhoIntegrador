"use client";

import { useState } from "react";
import Link from "next/link";
import "./style.css"; 

export const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openNav = () => {
    setIsSidebarOpen(true);
  };

  const closeNav = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <div className="header">
        <Link href="/" className="logo-styleDoLink">
          <img
            src="/logo-simbolo.png"
            alt="Contaseg Logo"
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
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <button className="closebtn" onClick={closeNav}>
          &times;
        </button>
        <Link href="/list-person">Usuários</Link>
        <Link href="/list-companies">Empresas</Link>
        <Link href="/list-roles">Papéis</Link>
      </div>
    </>
  );
};
