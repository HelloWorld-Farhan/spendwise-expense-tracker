import { AlertCircle, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createExpense,
  deleteExpense,
  getBudgets,
  getCategories,
  getExpenses,
  getSummary,
  updateBudget,
  updateExpense
} from "./api.js";
import BudgetPanel from "./components/BudgetPanel.jsx";
import CategoryChart from "./components/CategoryChart.jsx";
import ExpenseForm from "./components/ExpenseForm.jsx";
import ExpenseTable from "./components/ExpenseTable.jsx";
import Filters from "./components/Filters.jsx";
import SummaryCards from "./components/SummaryCards.jsx";
import { formatCurrency, formatDate } from "./utils/formatters.js";

const defaultFilters = {
  category: "All",
  range: "all",
  startDate: "",
  endDate: ""
};

const emptySummary = {
  count: 0,
  visibleTotal: 0,
  totalSpentThisMonth: 0,
  highestSingleExpense: null,
  categoryTotals: [],
  currentMonthCategoryTotals: []
};

export default function App() {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [budgets, setBudgets] = useState({});
  const [filters, setFilters] = useState(defaultFilters);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const categoryTotals = useMemo(() => summary.categoryTotals || [], [summary.categoryTotals]);
  const currentMonthCategoryTotals = useMemo(
    () => summary.currentMonthCategoryTotals || [],
    [summary.currentMonthCategoryTotals]
  );

  async function loadStaticData() {
    try {
      const [categoryResponse, budgetResponse] = await Promise.all([getCategories(), getBudgets()]);
      setCategories(categoryResponse.data);
      setBudgets(budgetResponse.data);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function loadExpenseData(activeFilters = filters) {
    setIsLoading(true);
    setError("");

    try {
      const [expenseResponse, summaryResponse] = await Promise.all([
        getExpenses(activeFilters),
        getSummary(activeFilters)
      ]);

      setExpenses(expenseResponse.data);
      setSummary(summaryResponse.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStaticData();
  }, []);

  useEffect(() => {
    loadExpenseData(filters);
  }, [filters]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setNotice(""), 2500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  async function handleExpenseSubmit(payload) {
    setIsSaving(true);
    setError("");

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
        setNotice("Expense updated.");
        setEditingExpense(null);
      } else {
        await createExpense(payload);
        setNotice("Expense added.");
      }

      await loadExpenseData();
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(expense) {
    const confirmed = window.confirm(`Delete ${formatCurrency(expense.amount)} for ${expense.category}?`);

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await deleteExpense(expense.id);
      setNotice("Expense deleted.");
      await loadExpenseData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleBudgetSave(category, limit) {
    setIsSaving(true);
    setError("");

    try {
      const response = await updateBudget(category, limit);
      setBudgets(response.data);
      setNotice(`${category} budget saved.`);
      await loadExpenseData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleFilterChange(nextFilters) {
    setFilters(nextFilters);
  }

  function handleResetFilters() {
    setFilters(defaultFilters);
  }

  function handleExportCsv() {
    if (expenses.length === 0) {
      setNotice("No expenses to export.");
      return;
    }

    const rows = [
      ["Date", "Category", "Note", "Amount"],
      ...expenses.map((expense) => [
        formatDate(expense.date),
        expense.category,
        expense.note || "",
        String(expense.amount)
      ])
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "spendwise-expenses.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("CSV exported.");
  }

  return (
    <main className="page-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">
          <WalletCards size={28} />
        </div>
        <div>
          <p className="eyebrow">Mini Expense Tracker</p>
          <h1>SpendWise</h1>
        </div>
      </header>

      {error && (
        <div className="alert" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          {error}
        </div>
      )}

      {notice && <div className="toast">{notice}</div>}

      <SummaryCards summary={summary} />

      <Filters
        categories={categories}
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        onExport={handleExportCsv}
        isExportDisabled={expenses.length === 0}
      />

      <div className="content-grid">
        <div className="side-stack">
          <ExpenseForm
            categories={categories}
            editingExpense={editingExpense}
            onSubmit={handleExpenseSubmit}
            onCancelEdit={() => setEditingExpense(null)}
            isSaving={isSaving}
          />
          <BudgetPanel
            categories={categories}
            budgets={budgets}
            monthlyTotals={currentMonthCategoryTotals}
            onSaveBudget={handleBudgetSave}
            isSaving={isSaving}
          />
        </div>

        <div className="main-stack">
          <CategoryChart categoryTotals={categoryTotals} />
          <ExpenseTable
            expenses={expenses}
            onEdit={setEditingExpense}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </div>
      </div>
    </main>
  );
}
