'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CompanyRow from '../components/companyRow';
import './style.css';
import { Header } from '../components/header';

type Company = {
  cnpj: string;
  razao_social: string;
  email: string;
  telefone1: string;
  telefone2:string;
  data_criacao:string;  
};

const ListCompanies = () => {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);

async function loadCompanies() {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/business', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'  
        },
      });
  
      if (response.ok) {
         const data = await response.json();
         setCompanies(data.data);
      } else {
        console.error(`Erro ao carregar empresa: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  }
  useEffect(() => {
    loadCompanies();
  }, []);

  const handleDelete = async (companyCNPJ: string) => {
    const confirmed = confirm(`Tem certeza que deseja excluir esta empresa?(Essa ação é irreversível)`);
    if (confirmed) {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`https://8351-177-184-217-182.ngrok-free.app/business/${companyCNPJ}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          setCompanies(companies.filter(company => company.cnpj !== companyCNPJ));
        } else {
          if(response.status === 500){
            alert("Não é possível excluir empresas com pessoas associadas");
          }
        }
      } catch (error) {
        console.error('Erro na requisição DELETE:', error);
        
      }
    }
  };

  useEffect(() => {
    loadCompanies();
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
                name={company.razao_social}
                email={company.email}
                creationDate={company.data_criacao}
                phone={company.telefone1}
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
