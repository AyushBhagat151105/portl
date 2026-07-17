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
  options: ExportOptions
) {
  // 1. Apply Filters
  let filteredBudgets = budgets;
  let filteredExpenses = expenses;
  let filteredFestivals = festivals;

  // Date range filtering
  if (options.dateRange !== "all") {
    filteredBudgets = budgets.filter((b) => isWithinDateRange(b.startDate, options) || isWithinDateRange(b.endDate, options));
    filteredExpenses = expenses.filter((e) => isWithinDateRange(e.date, options));
    filteredFestivals = festivals.filter((f) => isWithinDateRange(f.date, options));
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
      csvContent += "=== SCHEDULED FESTIVALS ===\n";
      csvContent += "Name,Description,Date,Allocated Budget (INR)\n";
      filteredFestivals.forEach((f) => {
        csvContent += `"${f.name}","${f.description || "-"}","${new Date(f.date).toLocaleDateString()}",${f.budget?.allocatedAmount || 0}\n`;
      });
    }

    await shareCSV(csvContent, fileName, displayTitle);
    return;
  }

  // 3. PDF Generation
  const totalAllocated = filteredBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netPosition = totalAllocated - totalSpent;

  let budgetsRows = "";
  if (options.scope === "all" || options.scope === "budgets") {
    budgetsRows = filteredBudgets.map((b) => {
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
  }

  let expensesRows = "";
  if (options.scope === "all" || options.scope === "expenses") {
    expensesRows = filteredExpenses.map((e) => {
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
  }

  let festivalsRows = "";
  if (options.scope === "all") {
    festivalsRows = filteredFestivals.map((f) => {
      return `
        <tr>
          <td><strong>${f.name}</strong></td>
          <td style="color:#78716c;">${f.description || "-"}</td>
          <td>${new Date(f.date).toLocaleDateString()}</td>
          <td>₹${(f.budget?.allocatedAmount || 0).toLocaleString("en-IN")}</td>
        </tr>`;
    }).join("");
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1c1917; margin: 0; padding: 32px; background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #b45309; padding-bottom: 16px; }
        .header h1 { font-size: 22px; font-weight: 800; margin: 0; color: #1c1917; }
        .header p  { font-size: 11px; color: #78716c; margin: 4px 0 0; }
        .filter-badge { background: #f5f5f4; border: 1px solid #e7e5e4; padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: bold; margin-top: 6px; display: inline-block; color: #44403c; }
        .summary { display: flex; gap: 16px; margin-bottom: 28px; }
        .summary-card { flex: 1; background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 14px 16px; }
        .summary-card .label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: #78716c; }
        .summary-card .value { font-size: 18px; font-weight: 900; color: #1c1917; margin-top: 4px; }
        .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; margin: 24px 0 10px; color: #b45309; border-left: 3px solid #b45309; padding-left: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px; }
        th { background: #1c1917; color: #fff; padding: 8px 10px; text-align: left; font-weight: 700; font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; }
        td { padding: 8px 10px; border-bottom: 1px solid #f5f5f4; vertical-align: middle; }
        tr:nth-child(even) td { background: #fafaf9; }
        .footer { margin-top: 32px; font-size: 9px; color: #a8a29e; text-align: center; border-top: 1px solid #f5f5f4; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Portl &ndash; Society Treasury Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <div class="filter-badge">
            Period: ${dateLabel.replace(/_/g, " ")} 
            ${options.category && options.category !== "ALL" ? ` | Category: ${options.category}` : ""}
          </div>
        </div>
      </div>

      <div class="summary">
        <div class="summary-card">
          <div class="label">Total Budgeted</div>
          <div class="value">₹${totalAllocated.toLocaleString("en-IN")}</div>
        </div>
        <div class="summary-card">
          <div class="label">Total Expenses</div>
          <div class="value" style="color:#ef4444;">₹${totalSpent.toLocaleString("en-IN")}</div>
        </div>
        <div class="summary-card">
          <div class="label">Remaining Funds</div>
          <div class="value" style="color:${netPosition < 0 ? '#ef4444' : '#10b981'};">₹${netPosition.toLocaleString("en-IN")}</div>
        </div>
      </div>

      ${(options.scope === "all" || options.scope === "budgets") && filteredBudgets.length > 0 ? `
        <div class="section-title">Budgets Directory</div>
        <table>
          <thead>
            <tr>
              <th>Title</th><th>Allocated</th><th>Spent</th><th>Remaining</th><th>Validity Period</th>
            </tr>
          </thead>
          <tbody>${budgetsRows}</tbody>
        </table>
      ` : ""}

      ${(options.scope === "all" || options.scope === "expenses") && filteredExpenses.length > 0 ? `
        <div class="section-title">Expenses Log</div>
        <table>
          <thead>
            <tr>
              <th>Title</th><th>Amount</th><th>Category</th><th>Description</th><th>Date</th><th>Associated Budget</th>
            </tr>
          </thead>
          <tbody>${expensesRows}</tbody>
        </table>
      ` : ""}

      ${options.scope === "all" && filteredFestivals.length > 0 ? `
        <div class="section-title">Scheduled Festivals</div>
        <table>
          <thead>
            <tr>
              <th>Festival Event Name</th><th>Description</th><th>Planned Date</th><th>Allocated Budget</th>
            </tr>
          </thead>
          <tbody>${festivalsRows}</tbody>
        </table>
      ` : ""}

      <div class="footer">Generated by Portl Smart Transport & Society Operations Platform</div>
    </body>
    </html>`;

  await sharePDF(html, fileName, displayTitle);
}
