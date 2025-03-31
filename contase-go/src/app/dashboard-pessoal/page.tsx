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
  const [info, setInfo] = useState<DPInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  async function verifyToken() {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch('http://localhost:3001/auth/validate-token', {
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
      setIsLoading(true);
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/dashboard/departamento-pessoal', {
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
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInfo();
  }, []);

  const downloadPDF = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem('access_token');
      
      // Fetch the PDF as a blob
      const response = await fetch('http://localhost:3001/dashboard/departamento-pessoal/pdf', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      
      if (!response.ok) {
        throw new Error('Falha ao baixar o relatório');
      }
      
      // Convert the response to a blob
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element to download the file
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'Relatório_Departamento_Pessoal.pdf';
      
      // Append to the document body, click the link, and remove it
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar o PDF:', error);
      alert('Não foi possível baixar o relatório. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback data for development/preview
  const data = info || {
    total_funcionarios: 3,
    total_folha: 152587.51,
    aliquota: 0.5799999833106995,
    anexo: 2
  };

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
          <div className="download-button-container">
            <button 
              className="download-button" 
              onClick={downloadPDF}
              disabled={isLoading}
            >
              {isLoading ? 'Gerando relatório...' : 'Baixar Relatório PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardData;