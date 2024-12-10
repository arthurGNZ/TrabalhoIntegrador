'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import './style.css';
import { Header } from '../components/header';
import { useRouter } from 'next/navigation';

type Company = {
  cnpj: string;
  razao_social: string;
};

const HomeUser = () => {
  const [selectedCompany, setSelectedCompany] = useState(''); 
  const [companies, setCompanies] = useState<Company[]>([]);

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
      const verifyToken = await response.json();
      if (!verifyToken.valid) {
        router.push('/login');
      }
    }
  }

  useEffect(() => {
    verifyToken();
  }, []);

  async function loadCompanies() {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/business/short', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setCompanies(data.data);
        console.log(companies);
        
      } else {
        console.log('Erro ao carregar empresas');
      }
    } catch (error) {
      console.log('Erro na requisição:', error);
    }
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  async function changeCompany(cnpj: string) {
    try {
      const accessToken = localStorage.getItem('access_token');
      const data = { cnpj_empresa:cnpj };
      const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/auth/change-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const dataResponse = await response.json();
        console.log('Empresa trocada com sucesso');
      } else {
        console.log('Erro ao trocar empresa');
      }
    } catch (error) {
      console.log('Erro na requisição:', error);
    }
  }

  const handleCompanyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCnpj = event.target.value;
    setSelectedCompany(newCnpj);
    changeCompany(newCnpj);
  };

  return (
    <div className="page">
      <Header />
      <div className="container-home">
        <div className="infoBanner">
          <p>Você está visualizando as informações da empresa:</p>
        </div>
        <div className="selectionBox">
          <h3>Selecione a empresa:</h3>
          <select
            className="companySelect"
            value={selectedCompany}
            onChange={handleCompanyChange}
          >
            {companies.map((company,index) => (
              <option key={index} value={company.cnpj}>
                {company.razao_social}
              </option>
            ))}
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
