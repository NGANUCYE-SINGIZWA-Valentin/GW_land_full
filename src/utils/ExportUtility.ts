/**
 * Utility functions for exporting dashboard data to CSV and printable PDF/HTML reports
 */

export function exportToCSV<T extends Record<string, any>>(data: T[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = ('' + (val ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printSummaryReport(title: string, headers: string[], rows: (string | number)[][]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const tableHeaders = headers.map(h => `<th style="padding: 10px; border-bottom: 2px solid #1B395F; text-align: left; font-size: 12px; font-weight: bold; color: #1B395F;">${h}</th>`).join('');
  const tableRows = rows
    .map(
      r =>
        `<tr style="border-bottom: 1px solid #E2E8F0;">${r
          .map(cell => `<td style="padding: 10px; font-size: 12px; color: #334155;">${cell}</td>`)
          .join('')}</tr>`
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - GW LAND Report</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1B395F; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #54B5BB; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 900; }
          .logo span { color: #54B5BB; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .footer { margin-top: 40px; font-size: 11px; color: #94A3B8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">GW<span>LAND</span></div>
          <div>
            <h2 style="margin: 0; font-size: 18px;">${title}</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748B;">Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="footer">
          GW LAND Real Estate & Land Listing Platform • Official Confidential Report
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}
