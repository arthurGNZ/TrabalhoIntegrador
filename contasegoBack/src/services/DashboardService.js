class DashboardService {
    async getDepartmentData(empresaToken) {
      try {
        return {
          total_funcionarios: 18,
          total_folha: 54675.00,
          aliquota: 0.58,
          anexo: "III"
        };
   
      } catch (error) {
        throw new Error(`Erro ao buscar dados: ${error.message}`);
      }
    }
   
    async getFiscalData(empresaToken) {
      try {
        return {
          faturamento_bruto: [
            { mes: 10, ano: 2024, valor: 150000.00 },
            { mes: 9, ano: 2024, valor: 145000.00 },
            { mes: 8, ano: 2024, valor: 155000.00 },
            { mes: 7, ano: 2024, valor: 148000.00 },
            { mes: 6, ano: 2024, valor: 152000.00 },
            { mes: 5, ano: 2024, valor: 147000.00 },
            { mes: 4, ano: 2024, valor: 151000.00 },
            { mes: 3, ano: 2024, valor: 146000.00 },
            { mes: 2, ano: 2024, valor: 153000.00 },
            { mes: 1, ano: 2024, valor: 149000.00 },
            { mes: 12, ano: 2023, valor: 154000.00 },
            { mes: 11, ano: 2023, valor: 150000.00 }
          ],
          faturamento_liquido: [
            { mes: 10, ano: 2024, valor: 135000.00 },
            { mes: 9, ano: 2024, valor: 130500.00 },
            { mes: 8, ano: 2024, valor: 139500.00 },
            { mes: 7, ano: 2024, valor: 133200.00 },
            { mes: 6, ano: 2024, valor: 136800.00 },
            { mes: 5, ano: 2024, valor: 132300.00 },
            { mes: 4, ano: 2024, valor: 135900.00 },
            { mes: 3, ano: 2024, valor: 131400.00 },
            { mes: 2, ano: 2024, valor: 137700.00 },
            { mes: 1, ano: 2024, valor: 134100.00 },
            { mes: 12, ano: 2023, valor: 138600.00 },
            { mes: 11, ano: 2023, valor: 135000.00 }
          ]
        };
   
      } catch (error) {
        throw new Error(`Erro ao buscar dados fiscais: ${error.message}`);
      }
    }
   }
   
   module.exports = new DashboardService();