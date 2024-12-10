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

type Permission = {
  sigla: string;
  nome: string;
  descricao: string;
};

const HomeUser = () => {
  const [selectedCompany, setSelectedCompany] = useState(''); 
  const [companies, setCompanies] = useState<Company[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const router = useRouter();
  function saveToken (token: any) {
    localStorage.setItem('access_token', token);
  }

  async function verifyToken() {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch('https:8351-177-184-217-182.ngrok-free.app/auth/validate-token', {
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
        setCompanies(data.data);


          setSelectedCompany(data.data[0].cnpj);
          verifyPermissions(data.data[0].cnpj);

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
      const data = { cnpj_empresa: cnpj };
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
        saveToken(dataResponse.token);
        console.log('Empresa trocada com sucesso');
      } else {
        console.log('Erro ao trocar empresa');
      }
    } catch (error) {
      console.log('Erro ao trocar empresa');
    }
  }

  async function verifyPermissions(cnpj: string) {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/other/permissions/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      } else {
        console.log('Erro ao verificar permissões');
      }
    } catch (error) {
      console.log('Erro ao verificar permissões');
    }
  }

  const handleCompanyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCnpj = event.target.value;
    setSelectedCompany(newCnpj);
    changeCompany(newCnpj);
    verifyPermissions(newCnpj);
  };

  
  const hasPermission = (sigla: string) => {
    if (permissions.some(permission => permission.sigla === 'ADM')) {
      return true;
    }
    if (permissions.some(permission => permission.sigla === 'DF') && sigla === 'DF') {
      return true; 
    }
    if (permissions.some(permission => permission.sigla === 'DP') && sigla === 'DP') {
      return true; 
    }
    return false; 
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
            {companies.map((company, index) => (
              <option key={index} value={company.cnpj}>
                {company.razao_social}
              </option>
            ))}
          </select>
          <h3>Deseja ver as estatísticas de:</h3>
          <div className="buttons">        
            {permissions.some(permission => permission.sigla === 'ADM') && (
              <>
                <Link href="/dashboard-fiscal" className="button">Departamento Fiscal</Link>
                <Link href="/dashboard-financeiro" className="button">Departamento Pessoal</Link>
              </>
            )}           
            {permissions.some(permission => permission.sigla === 'DF') && !permissions.some(permission => permission.sigla === 'ADM') && (
              <Link href="/dashboard-fiscal" className="button">Departamento Fiscal</Link>
            )}
            {permissions.some(permission => permission.sigla === 'DP') && !permissions.some(permission => permission.sigla === 'ADM') && (
              <Link href="/dashboard-financeiro" className="button">Departamento Pessoal</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeUser;

