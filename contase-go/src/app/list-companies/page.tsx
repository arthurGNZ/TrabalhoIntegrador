'use client';
import React, { useState, useEffect } from 'react';
import CompanyRow from '../components/companyRow';
import './style.css';
import { Header } from '../components/header';

type Company = {
  cnpj: string;
  name: string;
  email: string;
  creationDate: string;
  phone: string;
};

const ListCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);

  const handleEdit = (companyCNPJ: string) => {
    console.log(`Editando a empresa com CNPJ: ${companyCNPJ}`);
    // Lógica para editar a empresa
  };

  const handleDelete = (companyCNPJ: string) => {
    console.log(`Excluindo a empresa com CNPJ: ${companyCNPJ}`);
    // Lógica para excluir a empresa
  };

  useEffect(() => {
    setTimeout(() => {
      const fetchedCompanies: Company[] = [
        {
          cnpj: '00.000.000/0001-00',
          name: 'Empresa Exemplo',
          email: 'empresa@exemplo.com',
          creationDate: '01/01/2020',
          phone: '(11) 12345-6789',
        },
        {
          cnpj: '00.000.000/0001-01',
          name: 'Empresa Teste',
          email: 'empresa@teste.com',
          creationDate: '15/03/2021',
          phone: '(21) 98765-4321',
        },
        {
          cnpj: '00.000.000/0001-02',
          name: 'Empresa Demo',
          email: 'empresa@demo.com',
          creationDate: '23/07/2019',
          phone: '(31) 99876-1234',
        },
      ];
      setCompanies(fetchedCompanies);
    }, 1000); 
  }, []);

  return (
    <div className="container">
      <Header/>
      <div className="list-companies">
        <h3>Empresas Registradas</h3>
        <table className="table">
          <thead>
            <tr>
              <th>CNPJ</th>
              <th>Razão Social</th>
              <th>E-mail</th>
              <th>Data de Criação</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <CompanyRow
                key={company.cnpj}
                cnpj={company.cnpj}
                name={company.name}
                email={company.email}
                creationDate={company.creationDate}
                phone={company.phone}
                onEdit={() => handleEdit(company.cnpj)}
                onDelete={() => handleDelete(company.cnpj)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListCompanies;
