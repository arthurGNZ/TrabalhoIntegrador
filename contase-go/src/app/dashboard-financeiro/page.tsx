import React from "react";
import { Header } from "../components/header";

const DashboardFinanceiro = () => {
  return (
    <div>
      <Header/>
      <main style={{ marginTop: "80px", padding: "20px" }}>
        <h1>Bem-vindo ao Contaseg!</h1>
        <p>Gerencie usuários, empresas e papéis com facilidade.</p>
      </main>
    </div>
  );
};

export default DashboardFinanceiro;
