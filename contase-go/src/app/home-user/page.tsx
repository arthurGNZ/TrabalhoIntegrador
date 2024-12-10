'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import './style.css';
import { Header } from '../components/header';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
type Company = {
  cnpj: string;
  razao_social: string;
};

type Permission = {
  sigla: string;
  nome: string;
  descricao: string;
};

type DecodedToken = {
  cpf: string;
  nome: string;
  email: string;
  empresa: {
    cnpj: string;
    razao_social: string;
    email: string;
  };
  cargo: string;
  permissoes: Permission[];
};

const HomeUser = () => {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isChangingCompany, setIsChangingCompany] = useState(false);

  const router = useRouter();

  function saveToken(token: any) {
    localStorage.setItem('access_token', token);
  }

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

  async function loadCompanies() {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) return router.push('/login');

      // Decodificar o token para obter a empresa
      const decodedToken: DecodedToken = jwtDecode(accessToken);
      const tokenCompanyCnpj = decodedToken.empresa?.cnpj;

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

        if (data.data.length > 0) {
          // Definir a empresa do token como padrão ou a primeira da lista
          const defaultCompany = data.data.find((company: Company) => company.cnpj === tokenCompanyCnpj)?.cnpj || data.data[0].cnpj;
          setSelectedCompany(defaultCompany);
          await verifyPermissions(defaultCompany);
        }
      } else {
        console.log('Erro ao carregar empresas');
      }
    } catch (error) {
      console.log('Erro na requisição:', error);
    } finally {
      setIsInitialLoading(false);
    }
  }

  useEffect(() => {
    verifyToken();
    loadCompanies();
  }, []);

  async function changeCompany(cnpj: string) {
    try {
      setIsChangingCompany(true);
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
        await verifyPermissions(cnpj);
      } else {
        console.log('Erro ao trocar empresa');
      }
    } catch (error) {
      console.log('Erro ao trocar empresa');
    } finally {
      setIsChangingCompany(false);
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

  const handleCompanyChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCnpj = event.target.value;
    setSelectedCompany(newCnpj);
    await changeCompany(newCnpj);
  };

  if (isInitialLoading) {
    return <div>Carregando...</div>;
  }

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
            disabled={isChangingCompany}
          >
            {companies.map((company, index) => (
              <option key={index} value={company.cnpj}>
                {company.razao_social}
              </option>
            ))}
          </select>
          <h3>Deseja ver as estatísticas de:</h3>
          <div className="buttons">
            {isChangingCompany ? (
              <div>Atualizando permissões...</div>
            ) : (
              permissions.length > 0 && (
                <>
                  {(permissions.some(permission => permission.sigla === 'ADM') || 
                    permissions.some(permission => permission.sigla === 'DF')) && (
                    <Link href="/dashboard-financeiro" className="button">
                      Departamento Fiscal
                    </Link>
                  )}
                  {(permissions.some(permission => permission.sigla === 'ADM') || 
                    permissions.some(permission => permission.sigla === 'DP')) && (
                    <Link href="/dashboard-pessoal" className="button">
                      Departamento Pessoal
                    </Link>
                  )}
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeUser;
