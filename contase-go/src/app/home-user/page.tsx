'use client';
import { useState } from 'react';
import Link from 'next/link';
import './style.css';
import { Header } from '../components/header';

const HomeUser = () => {
  const [selectedCompany, setSelectedCompany] = useState('NomeDaEmpresa 1');
  const handleCompanyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompany(event.target.value);
  };

  return (
    <div className="page">
      <Header />
      <div className="container-home">
        <div className="infoBanner">
          <p>Você está visualizando as informações de {selectedCompany}:</p>
        </div>
        <div className="selectionBox">
          <h3>Selecione a empresa:</h3>
          <select className="companySelect" value={selectedCompany} onChange={handleCompanyChange}>
            <option value="NomeDaEmpresa 1">NomeDaEmpresa 1</option>
            <option value="NomeDaEmpresa 2">NomeDaEmpresa 2</option>
            <option value="NomeDaEmpresa 3">NomeDaEmpresa 3</option>
          </select>
          <h3>Deseja ver as estatísticas de:</h3>
          <div className="buttons">
            <Link href="departamento-fiscal.html" className="button">Departamento Fiscal</Link>
            <Link href="departamento-pessoal.html" className="button">Departamento Pessoal</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeUser;
