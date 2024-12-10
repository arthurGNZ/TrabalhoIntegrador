'use client';
import React, { useState, useEffect } from 'react';
import { Header } from '../components/header';
import { useRouter } from 'next/navigation';

interface FaturamentoItem {
  mes: number;
  ano: number;
  valor: number;
}

interface DashboardData {
  faturamento_bruto: FaturamentoItem[];
  faturamento_liquido: FaturamentoItem[];
}

interface DataPoint {
  x: number;
  y: number;
  valor: number;
  label: string;
}

interface Points {
  bruto: DataPoint[];
  liquido: DataPoint[];
}

interface SVGChartProps {
  data: DashboardData | null;
  maxValue: number;
  height?: number;
  width?: number;
}

const DashboardFinanceiro = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
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

  async function loadDashboardData() {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/dashboard/departamento-fiscal', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (response.ok) {
        const data: DashboardData = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.log('Erro ao carregar dados:', error);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMaxValue = (data: DashboardData | null): number => {
    if (!data) return 0;
    const allValues = [
      ...data.faturamento_bruto.map(item => item.valor),
      ...data.faturamento_liquido.map(item => item.valor)
    ];
    return Math.max(...allValues);
  };

  const formatMonthYear = (mes: number, ano: number): string => {
    return `${mes.toString().padStart(2, '0')}/${ano}`;
  };

  const SVGChart: React.FC<SVGChartProps> = ({ data, maxValue, height = 300, width = 800 }) => {
    if (!data) return null;

    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);

    const reversedBruto = [...data.faturamento_bruto].reverse();
    const reversedLiquido = [...data.faturamento_liquido].reverse();

    const points: Points = {
      bruto: reversedBruto.map((item, index) => ({
        x: (chartWidth / (reversedBruto.length - 1)) * index + padding,
        y: height - (item.valor / maxValue * chartHeight) - padding,
        valor: item.valor,
        label: formatMonthYear(item.mes, item.ano)
      })),
      liquido: reversedLiquido.map((item, index) => ({
        x: (chartWidth / (reversedLiquido.length - 1)) * index + padding,
        y: height - (item.valor / maxValue * chartHeight) - padding,
        valor: item.valor,
        label: formatMonthYear(item.mes, item.ano)
      }))
    };

    const createPath = (points: DataPoint[]): string => {
      return points.map((point, i) => 
        (i === 0 ? 'M' : 'L') + point.x + ',' + point.y
      ).join(' ');
    };

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="chart">
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => {
          const y = padding + (chartHeight / 4) * i;
          const value = formatCurrency(maxValue - (maxValue / 4) * i);
          return (
            <g key={i}>
              <line 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                stroke="#ffffff33"
                strokeDasharray="4"
              />
              <text x={5} y={y + 4} fill="#fff" fontSize="12">
                {value}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {points.bruto.map((point, i) => (
          <text 
            key={i}
            x={point.x}
            y={height - 10}
            fill="#fff"
            fontSize="12"
            textAnchor="middle"
          >
            {point.label}
          </text>
        ))}

        {/* Lines */}
        <path 
          d={createPath(points.bruto)} 
          fill="none" 
          stroke="#00c6ff" 
          strokeWidth="2"
        />
        <path 
          d={createPath(points.liquido)} 
          fill="none" 
          stroke="#0072ff" 
          strokeWidth="2"
        />

        {/* Data points */}
        {points.bruto.map((point, i) => (
          <g key={i}>
            <circle 
              cx={point.x} 
              cy={point.y} 
              r="4" 
              fill="#00c6ff"
            />
            <title>{formatCurrency(point.valor)}</title>
          </g>
        ))}
        {points.liquido.map((point, i) => (
          <g key={i}>
            <circle 
              cx={point.x} 
              cy={point.y} 
              r="4" 
              fill="#0072ff"
            />
            <title>{formatCurrency(point.valor)}</title>
          </g>
        ))}

        {/* Legend */}
        <g transform={`translate(${width - 200}, 20)`}>
          <circle cx="10" cy="10" r="4" fill="#00c6ff" />
          <text x="20" y="15" fill="#fff" fontSize="12">Faturamento Bruto</text>
          <circle cx="10" cy="30" r="4" fill="#0072ff" />
          <text x="20" y="35" fill="#fff" fontSize="12">Faturamento Líquido</text>
        </g>
      </svg>
    );
  };

  return (
    <div className="page">
      <Header />
      <div className="container-home">
        <div className="infoBanner">
          <p>Dashboard Financeiro</p>
        </div>
        <div className="selectionBox">
          <h3>Faturamento Mensal</h3>
          <div className="chart-container">
            <SVGChart 
              data={dashboardData} 
              maxValue={getMaxValue(dashboardData)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFinanceiro;