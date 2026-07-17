import { shareCSV, sharePDF } from "./export-utils";

export type DueRecord = {
  id: string;
  month: string;
  amount: number;
  status: "PENDING" | "PAID";
  dueDate: string;
  paidAt?: string | null;
  razorpayPaymentId?: string | null;
  flat: {
    number: string;
    tower: { name: string };
    residents: { name: string }[];
  };
};

// ─── CSV Export ───────────────────────────────────────────────────────────────
export async function exportDuesAsCSV(dues: DueRecord[], month?: string) {
  const header = "Month,Tower,Flat,Resident,Amount (INR),Status,Due Date,Paid At,Reference ID";

  const rows = dues.map((d) => {
    const resident = d.flat.residents.map((r) => r.name).join(" & ") || "Vacant";
    const paidAt = d.paidAt ? new Date(d.paidAt).toLocaleDateString() : "-";
    const dueDate = d.dueDate ? new Date(d.dueDate).toLocaleDateString() : "-";
    const ref = d.razorpayPaymentId || (d.status === "PAID" ? "OFFLINE" : "-");
    return [
      `"${d.month}"`,
      `"${d.flat.tower.name}"`,
      `"${d.flat.number}"`,
      `"${resident}"`,
      d.amount,
      d.status,
      `"${dueDate}"`,
      `"${paidAt}"`,
      `"${ref}"`,
    ].join(",");
  });

  const content = [header, ...rows].join("\n");
  const fileName = `portl_dues_${month?.replace(/\s/g, "_") ?? "all"}.csv`;

  await shareCSV(content, fileName, `Export Dues – ${month ?? "All Months"}`);
}



// ─── PDF Export ───────────────────────────────────────────────────────────────
export async function exportDuesAsPDF(dues: DueRecord[], month?: string) {
  const totalAmount = dues.reduce((sum, d) => sum + d.amount, 0);
  const paidCount = dues.filter((d) => d.status === "PAID").length;
  const pendingCount = dues.filter((d) => d.status === "PENDING").length;
  const collectedAmount = dues.filter((d) => d.status === "PAID").reduce((s, d) => s + d.amount, 0);

  const tableRows = dues
    .map((d) => {
      const resident = d.flat.residents.map((r) => r.name).join(", ") || "Vacant";
      const dueDate = d.dueDate ? new Date(d.dueDate).toLocaleDateString() : "-";
      const paidAt = d.paidAt ? new Date(d.paidAt).toLocaleDateString() : "-";
      const badgeColor = d.status === "PAID" ? "#10b981" : "#f59e0b";
      const ref = d.razorpayPaymentId || (d.status === "PAID" ? "OFFLINE" : "-");
      return `
        <tr>
          <td>${d.month}</td>
          <td>${d.flat.tower.name} \u2013 ${d.flat.number}</td>
          <td>${resident}</td>
          <td>\u20b9${d.amount.toLocaleString("en-IN")}</td>
          <td><span style="background:${badgeColor};color:#fff;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">${d.status}</span></td>
          <td>${dueDate}</td>
          <td>${paidAt}</td>
          <td style="font-size:10px;color:#71717a;">${ref}</td>
        </tr>`;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1c1917; margin: 0; padding: 32px; background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; border-bottom: 2px solid #f59e0b; padding-bottom: 16px; }
        .header h1 { font-size: 22px; font-weight: 800; margin: 0; color: #1c1917; }
        .header p  { font-size: 12px; color: #78716c; margin: 4px 0 0; }
        .summary { display: flex; gap: 16px; margin-bottom: 24px; }
        .summary-card { flex: 1; background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 14px 16px; }
        .summary-card .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: #78716c; }
        .summary-card .value { font-size: 20px; font-weight: 900; color: #1c1917; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #1c1917; color: #fff; padding: 10px 12px; text-align: left; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; }
        td { padding: 9px 12px; border-bottom: 1px solid #f5f5f4; vertical-align: middle; }
        tr:nth-child(even) td { background: #fafaf9; }
        .footer { margin-top: 24px; font-size: 10px; color: #a8a29e; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Portl \u2013 Dues & Billing Report</h1>
          <p>${month ? `Billing Period: ${month}` : "All Months"} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString()}</p>
        </div>
      </div>
      <div class="summary">
        <div class="summary-card">
          <div class="label">Total Bills</div>
          <div class="value">${dues.length}</div>
        </div>
        <div class="summary-card">
          <div class="label">Collected</div>
          <div class="value" style="color:#10b981;">${paidCount}</div>
        </div>
        <div class="summary-card">
          <div class="label">Pending</div>
          <div class="value" style="color:#f59e0b;">${pendingCount}</div>
        </div>
        <div class="summary-card">
          <div class="label">Amount Collected</div>
          <div class="value" style="font-size:16px;">\u20b9${collectedAmount.toLocaleString("en-IN")}</div>
        </div>
        <div class="summary-card">
          <div class="label">Total Billed</div>
          <div class="value" style="font-size:16px;">\u20b9${totalAmount.toLocaleString("en-IN")}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Month</th><th>Flat</th><th>Resident</th><th>Amount</th><th>Status</th><th>Due Date</th><th>Paid At</th><th>Reference</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="footer">Generated by Portl Society Management Platform</div>
    </body>
    </html>`;

  const fileName = `portl_dues_${month?.replace(/\s/g, "_") ?? "all"}.pdf`;
  await sharePDF(html, fileName, `Export Dues – ${month ?? "All Months"}`);
}
