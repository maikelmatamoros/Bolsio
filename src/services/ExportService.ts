import { Paths, File, Directory } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Platform } from 'react-native';
import { ITransaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ExportData {
  totalBalance: number;
  startMonth: Date;
  endMonth: Date;
  transactions: ITransaction[];
  currencySymbol: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export class ExportService {
  /**
   * Genera un reporte PDF con el balance y transacciones filtradas por rango de meses
   */
  static async generatePDFReport(data: ExportData): Promise<boolean> {
    try {
      const { totalBalance, startMonth, endMonth, transactions, currencySymbol } = data;

      // Crear fecha de inicio (primer día del mes a las 00:00:00)
      const startDate = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1, 0, 0, 0);
      
      // Crear fecha de fin (último día del mes a las 23:59:59)
      const endDate = new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0, 23, 59, 59);

      // Filtrar transacciones por rango de fechas
      const filteredTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= startDate && tDate <= endDate;
      });

      // Agrupar por mes
      const monthlyData = this.groupByMonth(filteredTransactions, startMonth, endMonth);

      // Calcular totales del período (sin contar transferencias)
      const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalTransfers = filteredTransactions
        .filter(t => t.type === 'transfer')
        .reduce((sum, t) => sum + t.amount, 0);

      const periodBalance = totalIncome - totalExpense;

      // Generar HTML del reporte
      const html = this.generateReportHTML({
        totalBalance,
        startMonth,
        endMonth,
        monthlyData,
        totalIncome,
        totalExpense,
        totalTransfers,
        periodBalance,
        currencySymbol,
        transactionCount: filteredTransactions.length,
        transactions: filteredTransactions,
      });

      // Generar PDF desde HTML usando expo-print
      const { uri } = await Print.printToFileAsync({ 
        html,
        width: 612,
        height: 792,
      });
      
      // Renombrar archivo con nombre descriptivo
      const fileName = `Bolsio_Reporte_${this.getMonthYear(startMonth)}_${this.getMonthYear(endMonth)}.pdf`;
      const newUri = `${Paths.cache.uri}/${fileName}`;
      
      // Eliminar archivo anterior si existe
      const newFile = new File(newUri);
      if (newFile.exists) {
        await newFile.delete();
      }
      
      // Mover/renombrar el archivo
      const file = new File(uri);
      await file.move(newFile);
      
      // Compartir PDF con el nombre correcto
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(newUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Exportar Reporte Bolsio',
          UTI: 'com.adobe.pdf',
        });
        return true;
      } else {
        console.warn('Sharing not available');
        return false;
      }
    } catch (error) {
      console.error('Error generating PDF report:', error);
      return false;
    }
  }

  /**
   * Agrupa transacciones por mes
   */
  private static groupByMonth(
    transactions: ITransaction[],
    startMonth: Date,
    endMonth: Date
  ): MonthlyData[] {
    const monthlyMap: { [key: string]: MonthlyData } = {};

    // Inicializar todos los meses en el rango
    const current = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
    const end = new Date(endMonth.getFullYear(), endMonth.getMonth(), 1);

    while (current <= end) {
      const key = this.getMonthYear(current);
      monthlyMap[key] = {
        month: current.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
        income: 0,
        expense: 0,
        balance: 0,
      };
      current.setMonth(current.getMonth() + 1);
    }

    // Sumar transacciones
    transactions.forEach(t => {
      const key = this.getMonthYear(new Date(t.date));
      if (monthlyMap[key]) {
        if (t.type === 'income') {
          monthlyMap[key].income += t.amount;
        } else {
          monthlyMap[key].expense += t.amount;
        }
        monthlyMap[key].balance = monthlyMap[key].income - monthlyMap[key].expense;
      }
    });

    return Object.values(monthlyMap);
  }

  /**
   * Genera el HTML del reporte
   */
  private static generateReportHTML(params: {
    totalBalance: number;
    startMonth: Date;
    endMonth: Date;
    monthlyData: MonthlyData[];
    totalIncome: number;
    totalExpense: number;
    totalTransfers: number;
    periodBalance: number;
    currencySymbol: string;
    transactionCount: number;
    transactions: ITransaction[];
  }): string {
    const {
      totalBalance,
      startMonth,
      endMonth,
      monthlyData,
      totalIncome,
      totalExpense,
      totalTransfers,
      periodBalance,
      currencySymbol,
      transactionCount,
      transactions,
    } = params;

    const monthlyRows = monthlyData
      .map(
        m => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-transform: capitalize;">${m.month}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #4CAF50; text-align: right;">
            ${formatCurrency(m.income, currencySymbol)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #F44336; text-align: right;">
            ${formatCurrency(m.expense, currencySymbol)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: bold; text-align: right;">
            ${formatCurrency(m.balance, currencySymbol)}
          </td>
        </tr>
      `
      )
      .join('');

    // Generar filas de transacciones (ordenadas por fecha)
    const sortedTransactions = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Limitar transacciones para evitar que el PDF sea muy grande
    const maxTransactions = 100;
    const displayedTransactions = sortedTransactions.slice(0, maxTransactions);
    const hasMore = sortedTransactions.length > maxTransactions;
    
    const transactionRows = displayedTransactions
      .map(
        t => {
          const typeColor = t.type === 'income' ? '#4CAF50' : t.type === 'transfer' ? '#2196F3' : '#F44336';
          const typeBgColor = t.type === 'income' ? '#E8F5E9' : t.type === 'transfer' ? '#E3F2FD' : '#FFEBEE';
          const typeLabel = t.type === 'income' ? 'Ingreso' : t.type === 'transfer' ? 'Transferencia' : 'Gasto';
          
          return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-size: 13px;">
            ${new Date(t.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-size: 13px;">
            ${t.description}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: center; font-size: 13px;">
            <span style="background: ${typeBgColor}; color: ${typeColor}; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 600;">
              ${typeLabel}
            </span>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: 600; color: ${typeColor}; font-size: 13px;">
            ${formatCurrency(t.amount, currencySymbol)}
          </td>
        </tr>
      `;
        }
      )
      .join('');

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte Bolsio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 40px 20px;
      background: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #6750A4 0%, #7E57C2 100%);
      color: white;
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 8px;
      font-weight: 700;
    }
    .header .subtitle {
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 32px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .summary-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #6750A4;
    }
    .summary-card.income { border-left-color: #4CAF50; }
    .summary-card.expense { border-left-color: #F44336; }
    .summary-card.balance { border-left-color: #2196F3; }
    .summary-card .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .summary-card .value {
      font-size: 24px;
      font-weight: 700;
      color: #333;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      margin: 32px 0 16px 0;
      color: #333;
    }
    .period-info {
      background: #f0f0f0;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      text-align: center;
    }
    .period-info .label {
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }
    .period-info .value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      text-transform: capitalize;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    thead {
      background: #f5f5f5;
    }
    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    th:not(:first-child) {
      text-align: right;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Bolsio</h1>
      <div class="subtitle">Reporte Financiero</div>
    </div>
    
    <div class="content">
      <!-- Balance Total -->
      <div class="summary">
        <div class="summary-card balance">
          <div class="label">Balance Total Actual</div>
          <div class="value">${formatCurrency(totalBalance, currencySymbol)}</div>
        </div>
      </div>

      <!-- Período del Reporte -->
      <div class="period-info">
        <div class="label">Período del Reporte</div>
        <div class="value">
          ${startMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })} - 
          ${endMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
        </div>
        <div style="margin-top: 8px; font-size: 14px; color: #666;">
          ${transactionCount} transacciones registradas
        </div>
      </div>

      <!-- Resumen del Período -->
      <h2 class="section-title">Resumen del Período</h2>
      <div class="summary">
        <div class="summary-card income">
          <div class="label">Total Ingresos</div>
          <div class="value" style="color: #4CAF50;">${formatCurrency(totalIncome, currencySymbol)}</div>
        </div>
        <div class="summary-card expense">
          <div class="label">Total Gastos</div>
          <div class="value" style="color: #F44336;">${formatCurrency(totalExpense, currencySymbol)}</div>
        </div>
        <div class="summary-card">
          <div class="label">Balance del Período</div>
          <div class="value" style="color: ${periodBalance >= 0 ? '#4CAF50' : '#F44336'};">
            ${formatCurrency(periodBalance, currencySymbol)}
          </div>
        </div>
        ${totalTransfers > 0 ? `
        <div class="summary-card">
          <div class="label">Transferencias</div>
          <div class="value" style="color: #2196F3;">${formatCurrency(totalTransfers, currencySymbol)}</div>
          <div style="font-size: 12px; color: #666; margin-top: 4px;">(Movimientos internos)</div>
        </div>
        ` : ''}
      </div>

      <!-- Desglose Mensual -->
      <h2 class="section-title">Desglose Mensual</h2>
      <table>
        <thead>
          <tr>
            <th>Mes</th>
            <th>Ingresos</th>
            <th>Gastos</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          ${monthlyRows}
        </tbody>
      </table>

      <!-- Detalle de Transacciones -->
      <h2 class="section-title" style="margin-top: 40px;">Detalle de Transacciones</h2>
      ${hasMore ? `<p style="color: #666; font-size: 14px; margin-bottom: 10px;">Mostrando las ${maxTransactions} transacciones más recientes de ${sortedTransactions.length} totales</p>` : ''}
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Descripción</th>
            <th style="text-align: center;">Tipo</th>
            <th style="text-align: right;">Monto</th>
          </tr>
        </thead>
        <tbody>
          ${transactionRows}
        </tbody>
      </table>

      <div class="footer">
        <p>Generado el ${new Date().toLocaleDateString('es-MX', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p style="margin-top: 8px;">Bolsio - Control de Finanzas Personales v1.0</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Obtiene el año-mes en formato YYYY-MM
   */
  private static getMonthYear(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
