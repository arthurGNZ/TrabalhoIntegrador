const { getFirebirdConnection } = require('../config/firebirdConfig');
const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');


class DashboardService {
    async getDepartmentData(empresaToken) {
        let db;
        try {
            if (!empresaToken || !empresaToken.cnpj) {
                throw new Error('CNPJ não fornecido no token');
            }

            db = await getFirebirdConnection();
        const cnpj = empresaToken.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

        //    const cnpj = '14.287.184/0001-27';

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
            if (!empresaToken || !empresaToken.cnpj) {
                throw new Error('CNPJ não fornecido no token');
            }

            db = await getFirebirdConnection();
            const cnpj = empresaToken.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
            
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
            let total_bruto = 0;
            let total_liquido = 0;

            results.forEach(row => {
                if (row.MES && row.ANO) {
                    const valorBruto = parseFloat(row.FATURAMENTO_BRUTO || 0);
                    const valorLiquido = parseFloat(row.FATURAMENTO_LIQUIDO || 0);
                    
                    total_bruto += valorBruto;
                    total_liquido += valorLiquido;

                    faturamento_bruto.push({
                        mes: parseInt(row.MES),
                        ano: parseInt(row.ANO),
                        valor: valorBruto
                    });

                    faturamento_liquido.push({
                        mes: parseInt(row.MES),
                        ano: parseInt(row.ANO),
                        valor: valorLiquido
                    });
                }
            });

            const sortByDate = (a, b) => {
                if (a.ano !== b.ano) return b.ano - a.ano;
                return b.mes - a.mes;
            };

            return {
                faturamento_bruto: faturamento_bruto.sort(sortByDate),
                faturamento_liquido: faturamento_liquido.sort(sortByDate),
                totals: {
                    faturamento_bruto: total_bruto,
                    faturamento_liquido: total_liquido
                }
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

    async generateFiscalPDF(empresaToken) {
        let db;
        try {
            if (!empresaToken || !empresaToken.cnpj) {
                throw new Error('CNPJ não fornecido no token');
            }

            // Get fiscal data using existing method
            const fiscalData = await this.getFiscalData(empresaToken);
            
            // Get company details
            db = await getFirebirdConnection();
            const cnpj = empresaToken.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
            
            const companyQuery = `
                SELECT 
                    NOMEESTAB, 
                    INSCRFEDERAL, 
                    TIPOINSCR as anexo
                FROM ESTAB
                WHERE INSCRFEDERAL = ?
                    AND DATAENCERATIV = '2100-12-31'`;
                    
            const companyResult = await db.query(companyQuery, [cnpj]);
            
            if (!companyResult || companyResult.length === 0) {
                throw new Error('Empresa não encontrada');
            }
            
            const company = {
                nome: companyResult[0].NOMEESTAB,
                cnpj: cnpj,
                anexo: companyResult[0].ANEXO
            };
            
            // Generate PDF
            const pdfFilePath = await this.createPDF(company, fiscalData);
            
            return {
                filePath: pdfFilePath,
                fileName: `Relatório_Fiscal_${empresaToken.cnpj}.pdf`
            };
            
        } catch (error) {
            console.error('Erro detalhado na geração do PDF:', error);
            throw new Error(`Erro ao gerar PDF fiscal: ${error.message}`);
        } finally {
            if (db) {
                await db.detach();
            }
        }
    }
    
    async createPDF(company, fiscalData) {
        return new Promise((resolve, reject) => {
            try {
                // Create temp directory if it doesn't exist
                const tempDir = path.join(__dirname, '../temp');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir);
                }
                
                // Create a filename based on timestamp and CNPJ
                const fileName = `relatorio_fiscal_${company.cnpj.replace(/[^0-9]/g, '')}_${Date.now()}.pdf`;
                const filePath = path.join(tempDir, fileName);
                
                // Create PDF document
                const doc = new PDFDocument({
                    margins: { top: 50, bottom: 50, left: 50, right: 50 },
                    size: 'A4'
                });
                
                // Pipe PDF to file
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);
                
                // Add company logo (assumes logo.png exists in assets folder)
                const logoPath = path.join(__dirname, '../assets/logo.png');
                if (fs.existsSync(logoPath)) {
                    doc.image(logoPath, 50, 45, { width: 50 });
                    doc.moveDown(2);
                } else {
                    doc.moveDown();
                }
                
                // Document title
                doc.fontSize(20).font('Helvetica-Bold').text('Relatório Departamento Fiscal', { align: 'center' });
                doc.moveDown();
                
                // Company information
                doc.fontSize(12).font('Helvetica-Bold').text('Informações da Empresa:');
                doc.fontSize(10).font('Helvetica').text(`Nome: ${company.nome}`);
                doc.text(`CNPJ: ${company.cnpj}`);
                doc.text(`Anexo do Simples Nacional: ${company.anexo}`);
                doc.moveDown(2);
                
                // Financial summary
                doc.fontSize(12).font('Helvetica-Bold').text('Resumo Financeiro:');
                doc.fontSize(10).font('Helvetica').text(`Faturamento Bruto Total (12 meses): R$ ${fiscalData.totals.faturamento_bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
                doc.text(`Faturamento Líquido Total (12 meses): R$ ${fiscalData.totals.faturamento_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
                doc.moveDown(2);
                
                // Monthly data
                doc.fontSize(12).font('Helvetica-Bold').text('Detalhamento por Mês:');
                
                // Create table headers
                const tableTop = doc.y + 10;
                const tableHeaders = ['Mês/Ano', 'Faturamento Bruto (R$)', 'Faturamento Líquido (R$)'];
                const columnWidth = (doc.page.width - 100) / 3;
                
                // Draw headers
                doc.fontSize(10).font('Helvetica-Bold');
                tableHeaders.forEach((header, i) => {
                    doc.text(header, 50 + (i * columnWidth), tableTop, { width: columnWidth, align: 'left' });
                });
                
                // Draw a line under headers
                doc.moveTo(50, tableTop + 20)
                   .lineTo(doc.page.width - 50, tableTop + 20)
                   .stroke();
                
                // Convert months number to name
                const monthNames = [
                    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                ];
                
                // Draw data rows
                let rowTop = tableTop + 30;
                doc.fontSize(9).font('Helvetica');
                
                // Ensure data is sorted by date
                const sortedData = [];
                for (let i = 0; i < fiscalData.faturamento_bruto.length; i++) {
                    const bruto = fiscalData.faturamento_bruto[i];
                    const liquido = fiscalData.faturamento_liquido[i];
                    
                    sortedData.push({
                        mes: bruto.mes,
                        ano: bruto.ano,
                        bruto: bruto.valor,
                        liquido: liquido.valor
                    });
                }
                
                sortedData.sort((a, b) => {
                    if (a.ano !== b.ano) return b.ano - a.ano;
                    return b.mes - a.mes;
                });
                
                // Draw data
                sortedData.forEach((row, i) => {
                    // Check if we need a new page
                    if (rowTop > doc.page.height - 100) {
                        doc.addPage();
                        rowTop = 50;
                        
                        // Re-draw headers on new page
                        doc.fontSize(10).font('Helvetica-Bold');
                        tableHeaders.forEach((header, j) => {
                            doc.text(header, 50 + (j * columnWidth), rowTop, { width: columnWidth, align: 'left' });
                        });
                        
                        // Draw a line under headers
                        doc.moveTo(50, rowTop + 20)
                           .lineTo(doc.page.width - 50, rowTop + 20)
                           .stroke();
                           
                        rowTop += 30;
                        doc.fontSize(9).font('Helvetica');
                    }
                    
                    // Draw row data
                    const monthName = monthNames[row.mes - 1];
                    doc.text(`${monthName}/${row.ano}`, 50, rowTop, { width: columnWidth, align: 'left' });
                    doc.text(`R$ ${row.bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 50 + columnWidth, rowTop, { width: columnWidth, align: 'left' });
                    doc.text(`R$ ${row.liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 50 + (2 * columnWidth), rowTop, { width: columnWidth, align: 'left' });
                    
                    // Add light gray line between rows
                    if (i < sortedData.length - 1) {
                        doc.moveTo(50, rowTop + 15)
                           .lineTo(doc.page.width - 50, rowTop + 15)
                           .strokeColor('#dddddd')
                           .stroke()
                           .strokeColor('#000000');
                    }
                    
                    rowTop += 20;
                });
                
                // Add a footer
                const pageCount = doc.bufferedPageRange().count;
                for (let i = 0; i < pageCount; i++) {
                    doc.switchToPage(i);
                    const now = new Date();
                    doc.fontSize(8)
                       .text(
                            `Relatório gerado em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')} - Página ${i + 1} de ${pageCount}`,
                            50,
                            doc.page.height - 50,
                            { align: 'center' }
                        );
                }
                
                // Finalize PDF
                doc.end();
                
                // Return file path when stream is closed
                stream.on('finish', () => {
                    resolve(filePath);
                });
                
                stream.on('error', (err) => {
                    reject(new Error(`Erro ao gerar arquivo PDF: ${err.message}`));
                });
                
            } catch (error) {
                reject(new Error(`Erro ao criar PDF: ${error.message}`));
            }
        });
    }

    async generateDepartmentPDF(empresaToken) {
        let db;
        try {
            if (!empresaToken || !empresaToken.cnpj) {
                throw new Error('CNPJ não fornecido no token');
            }
    
            // Obter dados do departamento pessoal usando método existente
            const departmentData = await this.getDepartmentData(empresaToken);
            
            // Obter detalhes da empresa
            db = await getFirebirdConnection();
            const cnpj = empresaToken.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
            
            const companyQuery = `
                SELECT 
                    NOMEESTAB, 
                    INSCRFEDERAL, 
                    TIPOINSCR as anexo
                FROM ESTAB
                WHERE INSCRFEDERAL = ?
                    AND DATAENCERATIV = '2100-12-31'`;
                    
            const companyResult = await db.query(companyQuery, [cnpj]);
            
            if (!companyResult || companyResult.length === 0) {
                throw new Error('Empresa não encontrada');
            }
            
            const company = {
                nome: companyResult[0].NOMEESTAB,
                cnpj: cnpj,
                anexo: companyResult[0].ANEXO
            };
            
            // Gerar PDF
            const pdfFilePath = await this.createDepartmentPDF(company, departmentData);
            
            return {
                filePath: pdfFilePath,
                fileName: `Relatório_Departamento_Pessoal_${empresaToken.cnpj}.pdf`
            };
            
        } catch (error) {
            console.error('Erro detalhado na geração do PDF:', error);
            throw new Error(`Erro ao gerar PDF do departamento pessoal: ${error.message}`);
        } finally {
            if (db) {
                await db.detach();
            }
        }
    }
    
    async createDepartmentPDF(company, departmentData) {
        return new Promise((resolve, reject) => {
            try {
                // Criar diretório temporário se não existir
                const tempDir = path.join(__dirname, '../temp');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir);
                }
                
                // Criar nome de arquivo baseado no timestamp e CNPJ
                const fileName = `relatorio_departamento_pessoal_${company.cnpj.replace(/[^0-9]/g, '')}_${Date.now()}.pdf`;
                const filePath = path.join(tempDir, fileName);
                
                // Criar documento PDF
                const doc = new PDFDocument({
                    margins: { top: 50, bottom: 50, left: 50, right: 50 },
                    size: 'A4'
                });
                
                // Direcionar PDF para arquivo
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);
                
                // Adicionar logo da empresa
                const logoPath = path.join(__dirname, '../assets/logo.png');
                if (fs.existsSync(logoPath)) {
                    doc.image(logoPath, 50, 45, { width: 50 });
                    doc.moveDown(2);
                } else {
                    doc.moveDown();
                }
                
                // Título do documento
                doc.fontSize(20).font('Helvetica-Bold').text('Relatório Departamento Pessoal', { align: 'center' });
                doc.moveDown();
                
                // Informações da empresa
                doc.fontSize(12).font('Helvetica-Bold').text('Informações da Empresa:');
                doc.fontSize(10).font('Helvetica').text(`Nome: ${company.nome}`);
                doc.text(`CNPJ: ${company.cnpj}`);
                doc.text(`Anexo do Simples Nacional: ${company.anexo}`);
                doc.moveDown(2);
                
                // Resumo dos dados do departamento pessoal
                doc.fontSize(12).font('Helvetica-Bold').text('Resumo Departamento Pessoal:');
                doc.fontSize(10).font('Helvetica').text(`Total de Funcionários: ${departmentData.total_funcionarios}`);
                doc.text(`Total da Folha de Pagamento: R$ ${departmentData.total_folha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
                doc.text(`Alíquota FAP: ${departmentData.aliquota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`);
                doc.moveDown();
                
                // Calcular a média salarial
                const mediaSalarial = departmentData.total_funcionarios > 0 
                    ? departmentData.total_folha / departmentData.total_funcionarios 
                    : 0;
                
                doc.text(`Média Salarial: R$ ${mediaSalarial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
                doc.moveDown();
                
                // Custos estimados
                doc.fontSize(12).font('Helvetica-Bold').text('Custos Estimados:');
                
                // Cálculo de custos adicionais (encargos)
                const encargos = {
                    inss: departmentData.total_folha * 0.20, // 20% INSS patronal
                    fgts: departmentData.total_folha * 0.08, // 8% FGTS
                    terceiros: departmentData.total_folha * 0.058, // 5,8% Terceiros
                    rat: departmentData.total_folha * (departmentData.aliquota / 100) // RAT com FAP
                };
                
                const totalEncargos = encargos.inss + encargos.fgts + encargos.terceiros + encargos.rat;
                const custoTotal = departmentData.total_folha + totalEncargos;
                
                // Adicionar tabela de custos
                const tableTop = doc.y + 10;
                const tableHeaders = ['Descrição', 'Valor (R$)'];
                const columnWidth = (doc.page.width - 100) / 2;
                
                // Desenhar cabeçalhos
                doc.fontSize(10).font('Helvetica-Bold');
                tableHeaders.forEach((header, i) => {
                    doc.text(header, 50 + (i * columnWidth), tableTop, { width: columnWidth, align: 'left' });
                });
                
                // Desenhar linha sob cabeçalhos
                doc.moveTo(50, tableTop + 20)
                   .lineTo(doc.page.width - 50, tableTop + 20)
                   .stroke();
                
                // Desenhar linhas de dados
                let rowTop = tableTop + 30;
                doc.fontSize(9).font('Helvetica');
                
                // Dados da tabela
                const tableData = [
                    { descricao: 'Salários Brutos', valor: departmentData.total_folha },
                    { descricao: 'INSS Patronal (20%)', valor: encargos.inss },
                    { descricao: 'FGTS (8%)', valor: encargos.fgts },
                    { descricao: 'Contribuições Terceiros (5,8%)', valor: encargos.terceiros },
                    { descricao: `RAT Ajustado (${departmentData.aliquota.toFixed(2)}%)`, valor: encargos.rat },
                    { descricao: 'Total Encargos', valor: totalEncargos },
                    { descricao: 'Custo Total', valor: custoTotal }
                ];
                
                // Desenhar dados
                tableData.forEach((row, i) => {
                    const isTotal = i >= tableData.length - 2;
                    
                    // Usar negrito para linhas de total
                    if (isTotal) {
                        doc.font('Helvetica-Bold');
                    }
                    
                    doc.text(row.descricao, 50, rowTop, { width: columnWidth, align: 'left' });
                    doc.text(`R$ ${row.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 50 + columnWidth, rowTop, { width: columnWidth, align: 'left' });
                    
                    // Desenhar linha entre linhas
                    if (i < tableData.length - 1) {
                        const lineColor = isTotal ? '#000000' : '#dddddd';
                        doc.moveTo(50, rowTop + 15)
                           .lineTo(doc.page.width - 50, rowTop + 15)
                           .strokeColor(lineColor)
                           .stroke()
                           .strokeColor('#000000');
                    }
                    
                    // Voltar para fonte normal
                    if (isTotal) {
                        doc.font('Helvetica');
                    }
                    
                    rowTop += 20;
                });
                
                // Adicionar gráfico de comparação
                doc.moveDown(2);
                doc.fontSize(12).font('Helvetica-Bold').text('Análise de Custos:', { align: 'center' });
                doc.moveDown();
                
                // Desenhar gráfico de pizza simples
                const centerX = doc.page.width / 2;
                const centerY = rowTop + 100;
                const radius = 80;
                
                // Calcular porcentagens
                const salariosPct = (departmentData.total_folha / custoTotal) * 100;
                const encargosPct = (totalEncargos / custoTotal) * 100;
                
                // Desenhar gráfico de pizza
                doc.circle(centerX, centerY, radius)
                   .lineWidth(1)
                   .fillAndStroke('#E1F5FE', '#000000');
                
                // Desenhar fatia para encargos
                const encargoRadians = (encargosPct / 100) * 2 * Math.PI;
                doc.moveTo(centerX, centerY)
                   .arc(centerX, centerY, radius, 0, encargoRadians)
                   .lineTo(centerX, centerY)
                   .fillAndStroke('#0D47A1', '#000000');
                
                // Legenda
                doc.fontSize(10).font('Helvetica');
                doc.rect(centerX - 100, centerY + 100, 12, 12).fill('#E1F5FE').stroke();
                doc.text(`Salários (${salariosPct.toFixed(1)}%)`, centerX - 80, centerY + 100);
                
                doc.rect(centerX + 20, centerY + 100, 12, 12).fill('#0D47A1').stroke();
                doc.text(`Encargos (${encargosPct.toFixed(1)}%)`, centerX + 40, centerY + 100);
                
                // Adicionar rodapé
                const pageCount = doc.bufferedPageRange().count;
                for (let i = 0; i < pageCount; i++) {
                    doc.switchToPage(i);
                    const now = new Date();
                    doc.fontSize(8)
                       .text(
                            `Relatório gerado em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')} - Página ${i + 1} de ${pageCount}`,
                            50,
                            doc.page.height - 50,
                            { align: 'center' }
                        );
                }
                
                // Finalizar PDF
                doc.end();
                
                // Retornar caminho do arquivo quando o stream for fechado
                stream.on('finish', () => {
                    resolve(filePath);
                });
                
                stream.on('error', (err) => {
                    reject(new Error(`Erro ao gerar arquivo PDF: ${err.message}`));
                });
                
            } catch (error) {
                reject(new Error(`Erro ao criar PDF do departamento pessoal: ${error.message}`));
            }
        });
    }
    
}


module.exports = new DashboardService();