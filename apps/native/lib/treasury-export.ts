import { shareCSV, sharePDF } from "./export-utils";

export type ExportOptions = {
  format: "csv" | "pdf";
  scope: "all" | "expenses" | "budgets";
  dateRange: "all" | "month" | "year" | "custom";
  startDate?: string;
  endDate?: string;
  category?: string;
};

// Filter helpers
function isWithinDateRange(dateStr: string, options: ExportOptions): boolean {
  const date = new Date(dateStr);
  const now = new Date();

  if (options.dateRange === "month") {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  if (options.dateRange === "year") {
    return date.getFullYear() === now.getFullYear();
  }
  if (options.dateRange === "custom" && options.startDate && options.endDate) {
    const start = new Date(options.startDate);
    const end = new Date(options.endDate);
    // Adjust end date to end of day
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  }
  return true; // All Time
}

export async function exportTreasuryReport(
  budgets: any[],
  expenses: any[],
  festivals: any[],
  fds: any[],
  dues: any[],
  options: ExportOptions
) {
  // 1. Apply Filters
  let filteredBudgets = budgets;
  let filteredExpenses = expenses;
  let filteredFestivals = festivals;
  let filteredFds = fds;
  let filteredDues = dues;

  // Date range filtering
  if (options.dateRange !== "all") {
    filteredBudgets = budgets.filter((b) => isWithinDateRange(b.startDate, options) || isWithinDateRange(b.endDate, options));
    filteredExpenses = expenses.filter((e) => isWithinDateRange(e.date, options));
    filteredFestivals = festivals.filter((f) => isWithinDateRange(f.date, options));
    filteredFds = fds.filter((f) => isWithinDateRange(f.startDate, options));
    filteredDues = dues.filter((d) => d.paidAt && isWithinDateRange(d.paidAt, options));
  }

  // Category filtering (expenses only)
  if (options.category && options.category !== "ALL") {
    filteredExpenses = filteredExpenses.filter((e) => e.category === options.category);
  }

  const titlePrefix = options.scope === "all" 
    ? "Financial_Statement" 
    : options.scope === "expenses" 
    ? "Expenses_Log" 
    : "Budgets_List";

  const dateLabel = options.dateRange === "all"
    ? "All_Time"
    : options.dateRange === "month"
    ? "This_Month"
    : options.dateRange === "year"
    ? "This_Year"
    : `${options.startDate}_to_${options.endDate}`;

  const fileName = `portl_treasury_${titlePrefix.toLowerCase()}_${dateLabel}.${options.format}`;
  const displayTitle = `Treasury Report – ${titlePrefix.replace(/_/g, " ")}`;

  // Filter out the opening balance from normal collections
  const openingBalanceDue = filteredDues.find((d) => d.month && d.month.includes("Opening Balance"));
  const openingBalanceAmount = openingBalanceDue ? openingBalanceDue.amount : 0;

  const normalPaidDues = filteredDues.filter((d) => d.status === "PAID" && !(d.month && d.month.includes("Opening Balance")));
  const totalDuesCollected = normalPaidDues.reduce((sum, d) => sum + d.amount, 0);
  const totalDuesReceivable = filteredDues.filter((d) => d.status !== "PAID" && !(d.month && d.month.includes("Opening Balance"))).reduce((sum, d) => sum + d.amount, 0);

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalFds = filteredFds.reduce((sum, f) => sum + f.amount, 0);

  const closingBalance = (openingBalanceAmount + totalDuesCollected) - totalSpent - totalFds;
  const closingCash = 0;
  const closingBank = Math.max(0, closingBalance - closingCash);

  // 2. CSV Generation
  if (options.format === "csv") {
    let csvContent = "";

    if (options.scope === "all" || options.scope === "budgets") {
      csvContent += "=== BUDGETS DIRECTORY ===\n";
      csvContent += "Title,Allocated Amount (INR),Spent Amount (INR),Remaining (INR),Start Date,End Date\n";
      filteredBudgets.forEach((b) => {
        const remaining = b.allocatedAmount - b.spentAmount;
        csvContent += `"${b.title}",${b.allocatedAmount},${b.spentAmount},${remaining},"${new Date(b.startDate).toLocaleDateString()}","${new Date(b.endDate).toLocaleDateString()}"\n`;
      });
      csvContent += "\n";
    }

    if (options.scope === "all" || options.scope === "expenses") {
      csvContent += "=== EXPENSES LOG ===\n";
      csvContent += "Title,Amount (INR),Category,Description,Date,Linked Budget\n";
      filteredExpenses.forEach((e) => {
        csvContent += `"${e.title}",${e.amount},"${e.category}","${e.description || "-"}","${new Date(e.date).toLocaleDateString()}","${e.budget?.title || "None"}"\n`;
      });
      csvContent += "\n";
    }

    if (options.scope === "all") {
      csvContent += "=== FIXED DEPOSITS LEDGER ===\n";
      csvContent += "Bank Name,Principal Amount (INR),Interest Rate (%),Start Date,Maturity Date,Status\n";
      filteredFds.forEach((f) => {
        csvContent += `"${f.bankName}",${f.amount},${f.interestRate || "-"},"${new Date(f.startDate).toLocaleDateString()}","${f.maturityDate ? new Date(f.maturityDate).toLocaleDateString() : "-"}","${f.status}"\n`;
      });
      csvContent += "\n";
    }

    await shareCSV(csvContent, fileName, displayTitle);
    return;
  }

  // Calculate block summaries for the left side of the sheet
  const summaries: Record<string, number> = {};
  normalPaidDues.forEach((due) => {
    if (due.flat?.tower) {
      const towerName = due.flat.tower.name;
      summaries[towerName] = (summaries[towerName] || 0) + due.amount;
    }
  });
  const blockSummariesList = Object.keys(summaries).map((blockName) => ({
    blockName,
    amount: summaries[blockName],
  })).sort((a, b) => a.blockName.localeCompare(b.blockName));

  // Construct Left (Receipts) and Right (Payments) Column rows chronologically/conceptually
  interface LedgerCell {
    date: string;
    title: string;
    amount: number;
    subdetails?: string[];
  }

  const leftRows: LedgerCell[] = [];
  const rightRows: LedgerCell[] = [];

  // --- Left Side: Inflows ---
  leftRows.push({
    date: "01/04/2025",
    title: "Opening Balance",
    amount: openingBalanceAmount,
    subdetails: [`Cash: ₹2,900`, `Bank: ₹${(openingBalanceAmount - 2900).toLocaleString("en-IN")}`]
  });

  leftRows.push({
    date: "01/04/2025",
    title: "Maintenance Deposits",
    amount: totalDuesCollected
  });

  blockSummariesList.forEach((b) => {
    leftRows.push({
      date: "31/03/2026",
      title: `• ${b.blockName}`,
      amount: b.amount
    });
  });

  // --- Right Side: Outflows & Asset Placements ---
  rightRows.push({
    date: "08/04/2025",
    title: "Fixed Deposit Placements",
    amount: totalFds,
    subdetails: filteredFds.map(f => `${f.bankName} (Rate: ${f.interestRate || 7.5}%)`)
  });

  rightRows.push({
    date: "31/03/2026",
    title: "Operating Expenditures",
    amount: totalSpent
  });

  filteredExpenses.forEach((e) => {
    rightRows.push({
      date: new Date(e.date).toLocaleDateString("en-IN"),
      title: `• ${e.title}`,
      amount: e.amount
    });
  });

  rightRows.push({
    date: "31/03/2026",
    title: "Closing Balance",
    amount: closingBalance,
    subdetails: [`Cash: ₹${closingCash.toLocaleString("en-IN")}`, `Bank: ₹${closingBank.toLocaleString("en-IN")}`]
  });

  // Generate balanced side-by-side rows
  const maxRows = Math.max(leftRows.length, rightRows.length);
  let sideBySideRowsHtml = "";
  for (let i = 0; i < maxRows; i++) {
    const left = leftRows[i];
    const right = rightRows[i];

    let leftDate = "";
    let leftDetails = "";
    let leftAmount = "";
    if (left) {
      leftDate = left.date;
      leftDetails = `<strong>${left.title}</strong>`;
      if (left.subdetails) {
        leftDetails += `<div class="subdetails">${left.subdetails.join("<br/>")}</div>`;
      }
      leftAmount = `₹${left.amount.toLocaleString("en-IN")}/-`;
    }

    let rightDate = "";
    let rightDetails = "";
    let rightAmount = "";
    if (right) {
      rightDate = right.date;
      rightDetails = `<strong>${right.title}</strong>`;
      if (right.subdetails) {
        rightDetails += `<div class="subdetails">${right.subdetails.join("<br/>")}</div>`;
      }
      rightAmount = `₹${right.amount.toLocaleString("en-IN")}/-`;
    }

    sideBySideRowsHtml += `
      <tr>
        <td class="center font-mono text-grey">${leftDate}</td>
        <td>${leftDetails}</td>
        <td class="right bold font-mono">${leftAmount}</td>
        <td class="center font-mono text-grey">${rightDate}</td>
        <td>${rightDetails}</td>
        <td class="right bold font-mono">${rightAmount}</td>
      </tr>
    `;
  }

  const grandTotal = openingBalanceAmount + totalDuesCollected;

  // Prepare table rows for Page 4 (Budgets)
  let budgetsRows = filteredBudgets.map((b) => {
    const remaining = b.allocatedAmount - b.spentAmount;
    return `
      <tr>
        <td><strong>${b.title}</strong></td>
        <td>₹${b.allocatedAmount.toLocaleString("en-IN")}</td>
        <td>₹${b.spentAmount.toLocaleString("en-IN")}</td>
        <td style="color:${remaining < 0 ? '#ef4444' : '#10b981'}; font-weight: bold;">₹${remaining.toLocaleString("en-IN")}</td>
        <td>${new Date(b.startDate).toLocaleDateString()} - ${new Date(b.endDate).toLocaleDateString()}</td>
      </tr>`;
  }).join("");

  // Prepare table rows for Page 5 (Expenses)
  let expensesRowsHtml = filteredExpenses.map((e) => {
    let badgeColor = "#71717a";
    if (e.category === "SALARIES") badgeColor = "#0ea5e9";
    if (e.category === "FESTIVAL") badgeColor = "#f59e0b";
    if (e.category === "REPAIRS") badgeColor = "#ef4444";
    if (e.category === "UTILITIES") badgeColor = "#8b5cf6";
    if (e.category === "MAINTENANCE") badgeColor = "#10b981";

    return `
      <tr>
        <td><strong>${e.title}</strong></td>
        <td>₹${e.amount.toLocaleString("en-IN")}</td>
        <td><span style="background:${badgeColor};color:#fff;padding:2px 8px;border-radius:20px;font-size:9px;font-weight:700;text-transform:uppercase;">${e.category}</span></td>
        <td style="color:#78716c;">${e.description || "-"}</td>
        <td>${new Date(e.date).toLocaleDateString()}</td>
        <td>${e.budget?.title || '<span style="color:#a8a29e; font-style:italic;">None</span>'}</td>
      </tr>`;
  }).join("");

  // Prepare table rows for Page 3 (Fixed Deposits)
  let fdsRowsHtml = filteredFds.map((f) => {
    return `
      <tr>
        <td><strong>${f.bankName}</strong></td>
        <td>₹${f.amount.toLocaleString("en-IN")}</td>
        <td>${f.interestRate ? `${f.interestRate}%` : "-"}</td>
        <td>${new Date(f.startDate).toLocaleDateString()}</td>
        <td>${f.maturityDate ? new Date(f.maturityDate).toLocaleDateString() : "-"}</td>
        <td><span style="color:#10b981;font-weight:700;">${f.status}</span></td>
      </tr>`;
  }).join("");

  // Prepare table rows for Page 2 (Block collection summary list)
  let blocksRowsHtml = blockSummariesList.map((b) => {
    return `
      <tr>
        <td><strong>${b.blockName}</strong></td>
        <td style="text-align: right; font-weight: bold; font-family: monospace;">₹${b.amount.toLocaleString("en-IN")}</td>
      </tr>`;
  }).join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1c1917; margin: 0; padding: 24px; background: #fff; }
        
        .page { page-break-after: always; padding: 12px 0; }
        .page:last-child { page-break-after: avoid; }
        
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #b45309; padding-bottom: 12px; }
        .header h1 { font-size: 20px; font-weight: 800; margin: 0; color: #1c1917; text-transform: uppercase; }
        .header p  { font-size: 10px; color: #78716c; margin: 3px 0 0; }

        .title-block { text-align: center; margin-bottom: 24px; border-bottom: 3px double #b45309; padding-bottom: 12px; }
        .title-block h1 { font-size: 16px; font-weight: 800; margin: 0; color: #1c1917; letter-spacing: 0.5px; }
        .title-block h2 { font-size: 13px; font-weight: 700; margin: 6px 0 0; color: #b45309; }
        .title-block p { font-size: 10px; color: #78716c; margin: 4px 0 0; }

        table.ledger-table { width: 100%; border-collapse: collapse; font-size: 9.5px; border: 1.5px solid #1c1917; }
        table.ledger-table th { background: #1c1917; color: #fff; padding: 8px 6px; border: 1px solid #1c1917; text-align: center; font-weight: bold; font-size: 9px; text-transform: uppercase; }
        table.ledger-table td { padding: 7px 8px; border: 1px solid #e7e5e4; vertical-align: top; line-height: 1.35; }
        
        table.ledger-table td:nth-child(3) { border-right: 1.5px solid #1c1917; }
        table.ledger-table th:nth-child(3) { border-right: 1.5px solid #1c1917; }

        table.detail-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 16px; }
        table.detail-table th { background: #1c1917; color: #fff; padding: 6px 8px; text-align: left; font-weight: 700; font-size: 8.5px; text-transform: uppercase; }
        table.detail-table td { padding: 6px 8px; border-bottom: 1px solid #f5f5f4; vertical-align: middle; }
        table.detail-table tr:nth-child(even) td { background: #fafaf9; }

        .subdetails { font-size: 8px; color: #78716c; margin-top: 4px; padding-left: 6px; border-left: 2px solid #b45309; font-weight: 500; }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .font-mono { font-family: 'Courier New', Courier, monospace; }
        .text-grey { color: #78716c; }
        .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; margin: 20px 0 8px; color: #b45309; border-left: 3px solid #b45309; padding-left: 8px; }

        .grand-total-row td { background: #fafaf9; border-top: 2.5px double #1c1917; border-bottom: 2.5px double #1c1917; font-size: 11px; font-weight: bold; padding: 10px 8px; }
        .footer { margin-top: 24px; font-size: 8px; color: #a8a29e; text-align: center; border-top: 1px solid #e7e5e4; padding-top: 12px; }
      </style>
    </head>
    <body>
      <!-- PAGE 1: TRIAL BALANCE SHEET STATEMENT -->
      <div class="page">
        <div class="title-block">
          <h1>Radhekrishan Park Co.Op. Housing & Commercial Service Society Ltd., Mahemdavad</h1>
          <h2>General Income & Expenditure Trial Balance Sheet (April 2025 – March 2026)</h2>
          <p>General Ledger Statement • Generated: ${new Date().toLocaleString()}</p>
        </div>

        <table class="ledger-table">
          <thead>
            <tr>
              <th colspan="3" style="background:#b45309;">RECEIPTS (INFLOW)</th>
              <th colspan="3" style="background:#1c1917;">PAYMENTS (OUTFLOW)</th>
            </tr>
            <tr style="background: #f5f5f4;">
              <th style="width: 8%; color: #1c1917;">Date</th>
              <th style="width: 27%; color: #1c1917; text-align: left;">Income Details</th>
              <th style="width: 15%; color: #1c1917; text-align: right;">Amount</th>
              <th style="width: 8%; color: #1c1917;">Date</th>
              <th style="width: 27%; color: #1c1917; text-align: left;">Payment Details</th>
              <th style="width: 15%; color: #1c1917; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${sideBySideRowsHtml}
            <tr class="grand-total-row">
              <td colspan="2" class="right">GRAND TOTAL (INFLOW)</td>
              <td class="right font-mono">₹${grandTotal.toLocaleString("en-IN")}/-</td>
              <td colspan="2" class="right">GRAND TOTAL (OUTFLOW)</td>
              <td class="right font-mono">₹${grandTotal.toLocaleString("en-IN")}/-</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">Page 1 of 5 &ndash; Radhekrishan Park Audits Layout</div>
      </div>

      <!-- PAGE 2: BLOCK-WISE COLLECTION LEDGER -->
      <div class="page">
        <div class="header">
          <div>
            <h1>Block-wise Collections</h1>
            <p>Maintenance Inflow Breakdown</p>
          </div>
        </div>
        
        <div class="section-title">Block Summary Ledger</div>
        <table class="detail-table" style="width: 60%; margin: 20px auto;">
          <thead>
            <tr>
              <th>Block / Shop Name</th>
              <th style="text-align: right;">Amount Collected</th>
            </tr>
          </thead>
          <tbody>
            ${blocksRowsHtml || '<tr><td colspan="2" style="text-align:center;">No records available</td></tr>'}
            <tr style="background:rgba(245,158,11,0.05); font-weight: bold; border-top: 2px solid #b45309;">
              <td><strong>TOTAL COLLECTION</strong></td>
              <td style="text-align: right; font-family: monospace;">₹${totalDuesCollected.toLocaleString("en-IN")}/-</td>
            </tr>
          </tbody>
        </table>
        <div class="footer">Page 2 of 5 &ndash; Radhekrishan Park Audits Layout</div>
      </div>

      <!-- PAGE 3: FIXED DEPOSITS LEDGER -->
      <div class="page">
        <div class="header">
          <div>
            <h1>Fixed Deposit Investments</h1>
            <p>Capital Reserve Placements</p>
          </div>
        </div>

        <div class="section-title">Registered Fixed Deposits</div>
        <table class="detail-table">
          <thead>
            <tr>
              <th>Bank Name</th>
              <th>Principal Amount</th>
              <th>Interest Rate</th>
              <th>Start Date</th>
              <th>Maturity Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${fdsRowsHtml || '<tr><td colspan="6" style="text-align:center; color:#78716c;">No active Fixed Deposits logged</td></tr>'}
          </tbody>
        </table>
        <div class="footer">Page 3 of 5 &ndash; Radhekrishan Park Audits Layout</div>
      </div>

      <!-- PAGE 4: BUDGETS DIRECTORY -->
      <div class="page">
        <div class="header">
          <div>
            <h1>Budgets Directory</h1>
            <p>Departmental Budget Allocations</p>
          </div>
        </div>

        <div class="section-title">Earmarked Dept Budgets</div>
        <table class="detail-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Allocated Amount</th>
              <th>Spent Amount</th>
              <th>Remaining Funds</th>
              <th>Validity Period</th>
            </tr>
          </thead>
          <tbody>
            ${budgetsRows || '<tr><td colspan="5" style="text-align:center; color:#78716c;">No budgets configured</td></tr>'}
          </tbody>
        </table>
        <div class="footer">Page 4 of 5 &ndash; Radhekrishan Park Audits Layout</div>
      </div>

      <!-- PAGE 5: OPERATING EXPENDITURES -->
      <div class="page">
        <div class="header">
          <div>
            <h1>Departmental Expenses</h1>
            <p>Society Cash Disbursements</p>
          </div>
        </div>

        <div class="section-title">Operating Costs Ledger</div>
        <table class="detail-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Description</th>
              <th>Date</th>
              <th>Budget Account</th>
            </tr>
          </thead>
          <tbody>
            ${expensesRowsHtml || '<tr><td colspan="6" style="text-align:center; color:#78716c;">No expenditures recorded</td></tr>'}
          </tbody>
        </table>
        <div class="footer">Page 5 of 5 &ndash; Radhekrishan Park Audits Layout</div>
      </div>
    </body>
    </html>`;

  await sharePDF(html, fileName, displayTitle);
}
