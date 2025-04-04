"use client";

import { useState, useEffect } from "react";
import { Header } from "../components/header";
import { DollarSign, TrendingUp, FileDown } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./style.css";

interface FaturamentoItem {
  mes: number;
  ano: number;
  valor: number;
}

interface ApiResponse {
  faturamento_bruto: FaturamentoItem[];
  faturamento_liquido: FaturamentoItem[];
  totals: {
    faturamento_bruto: number;
    faturamento_liquido: number;
  };
}

interface ChartData {
  name: string;
  faturamentoBruto: number;
  faturamentoLiquido: number;
}

const DashboardFiscal = () => {
  const [data, setData] = useState<ChartData[] | null>(null);
  const [totals, setTotals] = useState<ApiResponse['totals'] | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch(
          "http://localhost:3001/dashboard/departamento-fiscal",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (response.ok) {
          const jsonData: ApiResponse = await response.json();
          const formattedData = jsonData.faturamento_bruto.map((item: FaturamentoItem, index: number) => ({
            name: `${item.mes}/${item.ano}`,
            faturamentoBruto: Number(item.valor.toFixed(2)),
            faturamentoLiquido: Number(jsonData.faturamento_liquido[index].valor.toFixed(2)),
          })).reverse();
          
          setData(formattedData);
          setTotals(jsonData.totals);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, []);

  const downloadPDF = async () => {
    try {
      setIsDownloading(true);
      const accessToken = localStorage.getItem("access_token");
      
      const response = await fetch(
        "http://localhost:3001/dashboard/departamento-fiscal/pdf",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (response.ok) {
        // Obter o nome do arquivo do cabeçalho Content-Disposition, se disponível
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'relatorio-fiscal.pdf';
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }

        // Converter resposta para blob
        const blob = await response.blob();
        
        // Criar URL para o blob
        const url = window.URL.createObjectURL(blob);
        
        // Criar um elemento de link para download
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        
        // Adicionar à página, clicar e remover
        document.body.appendChild(a);
        a.click();
        
        // Limpar após download
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Erro ao baixar PDF:", response.statusText);
        alert("Não foi possível baixar o relatório. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      alert("Erro ao fazer download do relatório.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="chart-header">
            <div className="flex justify-between items-center w-full">
              <h1>Dashboard Fiscal</h1>
              <button
                onClick={downloadPDF}
                disabled={isDownloading || !data}
                className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium py-2 px-4 rounded-lg shadow transition-all duration-200 ${
                  isDownloading || !data ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'
                }`}
              >
                <FileDown size={18} />
                {isDownloading ? 'Baixando...' : 'Baixar Relatório PDF'}
              </button>
            </div>
            
            {totals && (
              <div className="w-full mb-6">
                <h2 className="text-lg font-semibold text-white mb-4 text-center">
                  Faturamento Total - Últimos 12 Meses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
                  {/* Card Faturamento Bruto */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg transform hover:scale-102 transition-transform duration-200">
                    <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6">
                      <div className="absolute inset-0 bg-white opacity-10 rounded-full"></div>
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-white/20 rounded-lg p-1.5">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-base font-medium text-white">Faturamento Bruto</h3>
                      </div>
                      <p className="text-2xl font-bold text-white mb-1">
                        {formatCurrency(totals.faturamento_bruto)}
                      </p>
                      <p className="text-blue-100 text-xs">Total acumulado em 12 meses</p>
                    </div>
                  </div>

                  {/* Card Faturamento Líquido */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 shadow-lg transform hover:scale-102 transition-transform duration-200">
                    <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6">
                      <div className="absolute inset-0 bg-white opacity-10 rounded-full"></div>
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-white/20 rounded-lg p-1.5">
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-base font-medium text-white">Faturamento Líquido</h3>
                      </div>
                      <p className="text-2xl font-bold text-white mb-1">
                        {formatCurrency(totals.faturamento_liquido)}
                      </p>
                      <p className="text-indigo-100 text-xs">Total acumulado em 12 meses</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h2>Faturamento Mensal</h2>
          </div>
          <div className="chart-wrapper">
            {data && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 35,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#666" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#fff"
                    tick={{ fill: '#fff', fontSize: 11 }}
                    dy={10}
                    height={60}
                  />
                  <YAxis 
                    stroke="#fff"
                    tick={{ fill: '#fff', fontSize: 11 }}
                    tickFormatter={formatCurrency}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#333',
                      border: '1px solid #666',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '12px',
                      padding: '8px'
                    }}
                    formatter={(value: number | string) => formatCurrency(value)}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      color: '#fff',
                      fontSize: '12px',
                      paddingTop: '10px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="faturamentoBruto"
                    name="Faturamento Bruto"
                    stroke="#00c6ff"
                    strokeWidth={2}
                    dot={{ fill: '#00c6ff', r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="faturamentoLiquido"
                    name="Faturamento Líquido"
                    stroke="#0072ff"
                    strokeWidth={2}
                    dot={{ fill: '#0072ff', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardFiscal;