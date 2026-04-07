import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportResultsProps {
  results: string[];
  history: { id: string; winner_value: string; created_at: string }[];
}

const ExportResults = ({ results, history }: ExportResultsProps) => {
  const exportCSV = () => {
    const rows = [['#', 'Winner', 'Time']];
    const data = history.length > 0 ? history : results.map((r, i) => ({ winner_value: r, created_at: new Date().toISOString() }));
    data.forEach((item, i) => {
      const val = 'winner_value' in item ? item.winner_value : String(item);
      const time = 'created_at' in item ? new Date(item.created_at).toLocaleString() : '';
      rows.push([String(i + 1), val, time]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spin-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const data = history.length > 0 ? history : results.map((r) => ({ winner_value: r, created_at: new Date().toISOString() }));
    // Generate a printable HTML and use browser print
    const html = `
      <!DOCTYPE html>
      <html><head><title>Spin Results</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #222; }
        h1 { font-size: 24px; margin-bottom: 4px; }
        p { color: #666; font-size: 12px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #7c3aed; color: white; padding: 10px 16px; text-align: left; font-size: 13px; }
        td { padding: 8px 16px; border-bottom: 1px solid #eee; font-size: 13px; }
        tr:nth-child(even) td { background: #fafafa; }
        .badge { display:inline-block; background:#fbbf24; color:#000; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:700; }
      </style></head><body>
      <h1>🎡 Spin Results</h1>
      <p>Exported on ${new Date().toLocaleString()} · ${data.length} results</p>
      <table>
        <thead><tr><th>#</th><th>Winner</th><th>Time</th></tr></thead>
        <tbody>
        ${data.map((item, i) => {
          const val = 'winner_value' in item ? item.winner_value : String(item);
          const time = 'created_at' in item ? new Date(item.created_at).toLocaleString() : '';
          return `<tr><td>${i === 0 ? '<span class="badge">🥇 1st</span>' : i === 1 ? '<span class="badge" style="background:#d1d5db">🥈 2nd</span>' : i === 2 ? '<span class="badge" style="background:#b45309;color:#fff">🥉 3rd</span>' : `#${i + 1}`}</td><td><strong>${val}</strong></td><td>${time}</td></tr>`;
        }).join('')}
        </tbody>
      </table>
      </body></html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 300);
    }
  };

  const hasData = results.length > 0 || history.length > 0;
  if (!hasData) return null;

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportCSV}
        className="flex-1 rounded-xl text-xs gap-1.5 h-8 border-border/20 hover:bg-primary/10 hover:text-primary hover:border-primary/30">
        <FileSpreadsheet className="w-3 h-3" /> CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportPDF}
        className="flex-1 rounded-xl text-xs gap-1.5 h-8 border-border/20 hover:bg-primary/10 hover:text-primary hover:border-primary/30">
        <FileText className="w-3 h-3" /> PDF
      </Button>
    </div>
  );
};

export default ExportResults;
