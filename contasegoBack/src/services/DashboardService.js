const { getFirebirdConnection } = require('../config/firebirdConfig');

class DashboardService {
    async getDepartmentData(empresaToken) {
        let db;
        try {
            /*if (!empresaToken || !empresaToken.cnpj) {
                throw new Error('CNPJ não fornecido no token');
            }*/

            db = await getFirebirdConnection();
            //const cnpj = empresaToken.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

            const cnpj = '14.287.184/0001-27';

            const query = `
                WITH empresas AS (
                    SELECT DISTINCT 
                        EMPRESAS.codigoempresa,
                        EMPRESAS.NOMEESTAB,
                        EMPRESAS.TIPOINSCR,
                        r.CALCULARFATORR
                    FROM ESTAB EMPRESAS
                    INNER JOIN OPCAOSSIMPLESFEDERAL r 
                        ON EMPRESAS.CODIGOEMPRESA = r.codigoempresa
                        AND r.CALCULARFATORR = 1
                        AND r.DATASSIMPLESFEDERAL = (
                            SELECT MAX(DATASSIMPLESFEDERAL)
                            FROM OPCAOSSIMPLESFEDERAL
                            WHERE codigoempresa = EMPRESAS.CODIGOEMPRESA
                        )
                    WHERE EMPRESAS.INSCRFEDERAL = ?
                        AND EMPRESAS.DATAENCERATIV = '2100-12-31'
                ),
                totaldp AS (
                    SELECT 
                        e.codigoempresa,
                        COALESCE((
                            SELECT COALESCE(t.valortotal, 0) - COALESCE((
                                SELECT valortotal
                                FROM TOTALSSIMPLESFEDERAL
                                WHERE codigoempresa = e.codigoempresa
                                    AND datatotal BETWEEN DATEADD(YEAR, -1, CAST ('2024-10-01' AS DATE)) 
                                    AND DATEADD(YEAR, -1, CAST ('2024-10-31' AS DATE))
                                    AND codigooperacaofis = 2687
                            ), 0)
                            FROM TOTALSSIMPLESFEDERAL t
                            WHERE t.codigoempresa = e.codigoempresa
                                AND t.datatotal BETWEEN '2024-10-01' AND '2024-10-31'
                                AND t.codigooperacaofis = 2692
                        ), 0) AS totaldp
                    FROM empresas e
                ),
                aliquota AS (
                    SELECT 
                        COALESCE(valortotal, 0) AS aliquota,
                        e.codigoempresa
                    FROM empresas e
                    LEFT JOIN TOTALSSIMPLESFEDERAL t 
                        ON e.codigoempresa = t.codigoempresa
                        AND t.codigooperacaofis = 2693
                        AND t.datatotal = '2024-10-01'
                ),
                funcionarios AS (
                    SELECT 
                        fc.codigoempresa,
                        COUNT(DISTINCT fc.codigofunccontr) as total_funcionarios
                    FROM FUNCCONTRATO fc
                    LEFT JOIN RESCISAO r ON fc.codigoempresa = r.codigoempresa
                        AND fc.codigofunccontr = r.codigofunccontr
                    WHERE fc.codigoempresa = (SELECT CODIGOEMPRESA FROM ESTAB WHERE INSCRFEDERAL = ?)
                        AND r.DATARESC IS NULL
                    GROUP BY fc.codigoempresa
                )
                SELECT 
                    e.codigoempresa,
                    COALESCE(f.total_funcionarios, 0) as total_funcionarios,
                    dp.totaldp AS total_folha,
                    CAST(alq.aliquota AS FLOAT) AS aliquota,
                    e.TIPOINSCR as anexo
                FROM empresas e
                LEFT JOIN totaldp dp ON e.codigoempresa = dp.codigoempresa
                LEFT JOIN aliquota alq ON e.codigoempresa = alq.codigoempresa
                LEFT JOIN funcionarios f ON e.codigoempresa = f.codigoempresa`;

            const result = await db.query(query, [cnpj, cnpj]);

            if (!result || result.length === 0) {
                throw new Error('Dados não encontrados para a empresa');
            }

            return {
                total_funcionarios: result[0].TOTAL_FUNCIONARIOS || 0,
                total_folha: parseFloat(result[0].TOTAL_FOLHA) || 0,
                aliquota: parseFloat(result[0].ALIQUOTA) || 0,
                anexo: result[0].ANEXO
            };

        } catch (error) {
            console.error('Erro detalhado:', error);
            throw new Error(`Erro ao buscar dados: ${error.message}`);
        } finally {
            if (db) {
                await db.detach();
            }
        }
    }

    async getFiscalData(empresaToken) {
        let db;
        try {
            /*if (!empresaToken || !empresaToken.cnpj) {
                throw new Error('CNPJ não fornecido no token');
            }*/

            db = await getFirebirdConnection();
            //const cnpj = empresaToken.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
            
            const cnpj = '14.287.184/0001-27';

            const query = `
                WITH empresas AS (
                    SELECT DISTINCT 
                        EMPRESAS.codigoempresa,
                        EMPRESAS.NOMEESTAB,
                        EMPRESAS.TIPOINSCR
                    FROM ESTAB EMPRESAS
                    WHERE EMPRESAS.INSCRFEDERAL = ?
                        AND EMPRESAS.DATAENCERATIV = '2100-12-31'
                ),
                faturamento_bruto AS (
                    SELECT 
                        e.codigoempresa,
                        t.datatotal,
                        EXTRACT(MONTH FROM t.datatotal) as mes,
                        EXTRACT(YEAR FROM t.datatotal) as ano,
                        SUM(t.valortotal) as valor_bruto
                    FROM empresas e
                    LEFT JOIN TOTALSSIMPLESFEDERAL t 
                        ON e.codigoempresa = t.codigoempresa
                        AND t.codigooperacaofis = 2686
                        AND t.datatotal BETWEEN DATEADD(MONTH, -11, CAST('2024-10-01' AS DATE)) 
                            AND CAST('2024-10-31' AS DATE)
                    GROUP BY 
                        e.codigoempresa,
                        t.datatotal
                ),
                faturamento_liquido AS (
                    SELECT 
                        e.codigoempresa,
                        t.datatotal,
                        SUM(t.valortotal) * 0.29 as valor_liquido
                    FROM empresas e
                    LEFT JOIN TOTALSSIMPLESFEDERAL t 
                        ON e.codigoempresa = t.codigoempresa
                        AND t.codigooperacaofis = 2686
                        AND t.datatotal BETWEEN DATEADD(MONTH, -11, CAST('2024-10-01' AS DATE)) 
                            AND CAST('2024-10-31' AS DATE)
                    GROUP BY 
                        e.codigoempresa,
                        t.datatotal
                )
                SELECT 
                    e.codigoempresa,
                    e.NOMEESTAB,
                    e.TIPOINSCR as anexo,
                    f.datatotal,
                    f.mes,
                    f.ano,
                    COALESCE(f.valor_bruto, 0) as faturamento_bruto,
                    COALESCE(l.valor_liquido, 0) as faturamento_liquido
                FROM empresas e
                LEFT JOIN faturamento_bruto f ON e.codigoempresa = f.codigoempresa
                LEFT JOIN faturamento_liquido l ON e.codigoempresa = l.codigoempresa 
                    AND f.datatotal = l.datatotal
                ORDER BY f.datatotal DESC`;

            const results = await db.query(query, [cnpj]);

            if (!results || results.length === 0) {
                throw new Error('Dados não encontrados para a empresa');
            }

            const faturamento_bruto = [];
            const faturamento_liquido = [];

            results.forEach(row => {
                if (row.MES && row.ANO) {
                    faturamento_bruto.push({
                        mes: parseInt(row.MES),
                        ano: parseInt(row.ANO),
                        valor: parseFloat(row.FATURAMENTO_BRUTO || 0)
                    });

                    faturamento_liquido.push({
                        mes: parseInt(row.MES),
                        ano: parseInt(row.ANO),
                        valor: parseFloat(row.FATURAMENTO_LIQUIDO || 0)
                    });
                }
            });

            const sortByDate = (a, b) => {
                if (a.ano !== b.ano) return b.ano - a.ano;
                return b.mes - a.mes;
            };

            return {
                faturamento_bruto: faturamento_bruto.sort(sortByDate),
                faturamento_liquido: faturamento_liquido.sort(sortByDate)
            };

        } catch (error) {
            console.error('Erro detalhado:', error);
            throw new Error(`Erro ao buscar dados fiscais: ${error.message}`);
        } finally {
            if (db) {
                await db.detach();
            }
        }
    }
}

module.exports = new DashboardService();