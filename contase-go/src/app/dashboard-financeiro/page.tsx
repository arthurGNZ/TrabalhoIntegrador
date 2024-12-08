"use client";

import { useState, useEffect } from "react";
import { Header } from "../components/header";
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
}

interface ChartData {
  name: string;
  faturamentoBruto: number;
  faturamentoLiquido: number;
}

const DashboardFiscal = () => {
  const [data, setData] = useState<ChartData[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch(
          "https://8351-177-184-217-182.ngrok-free.app/dashboard/departamento-fiscal",
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
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="chart-header">
            <h1>Dashboard Fiscal</h1>
            <h2>Faturamento Mensal</h2>
          </div>
          <div className="chart-wrapper">
            {data && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{
                    top: 20,    // Aumentado para acomodar a legenda
                    right: 30,  // Aumentado para valores não cortarem
                    left: 35,   // Aumentado para acomodar os valores em Reais
                    bottom: 20, // Aumentado para acomodar as datas
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#666" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#fff"
                    tick={{ fill: '#fff', fontSize: 11 }}
                    dy={10}    // Ajustado para baixo
                    height={60} // Altura mínima para o eixo X
                  />
                  <YAxis 
                    stroke="#fff"
                    tick={{ fill: '#fff', fontSize: 11 }}
                    tickFormatter={formatCurrency}
                    width={80}  // Largura fixa para acomodar os valores
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