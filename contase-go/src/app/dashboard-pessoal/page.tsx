'use client';
import { useState, useEffect } from 'react';
import './style.css';
import { Header } from '../components/header';
import { useRouter } from 'next/navigation';

type DPInfo = {
  total_funcionarios: number;
  total_folha: number;
  aliquota: number;
  anexo: number
};

const DashboardData = () => {
  const[info, setInfo] = useState<DPInfo[]>([]);
  const router = useRouter();
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

  async function loadInfo() {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/dashboard/departamento-pessoal', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInfo(data);
      } else {
        console.log('Erro ao carregar informação da empresa');
      }
    } catch (error) {
      console.log('Erro ao carregar informação da empresa');
    }
  }

  useEffect(() => {
    loadInfo();
  }, []);

  const [data, setData] = useState({
    total_funcionarios: 0,
    total_folha: 0,
    aliquota: 0,
    anexo: 0
  });

  useEffect(() => {
    const fetchedData = {
      total_funcionarios: 3,
      total_folha: 152587.51,
      aliquota: 0.5799999833106995,
      anexo: 2
    };
    setData(fetchedData);
  }, []);

  return (
    <div className="page">
      <Header />
      <div className="container-home">
        <div className="infoBanner">
          <p>Estatísticas da Empresa</p>
        </div>
        <div className="selectionBox">
          <h3>Informações Gerais</h3>
          <div className="info">
            <div className="infoItem">
              <strong>Total de Funcionários:</strong> {data.total_funcionarios}
            </div>
            <div className="infoItem">
              <strong>Total da Folha:</strong> R${data.total_folha.toFixed(2)}
            </div>
            <div className="infoItem">
              <strong>Alíquota:</strong> {(data.aliquota * 100).toFixed(2)}% 
            </div>
            <div className="infoItem">
              <strong>Anexo:</strong> {data.anexo}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardData;
