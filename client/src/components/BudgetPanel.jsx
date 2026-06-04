import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCurrency } from "../utils/formatters.js";

export default function BudgetPanel({ categories, budgets, monthlyTotals, onSaveBudget, isSaving }) {
  const [draftBudgets, setDraftBudgets] = useState({});
  const totalsByCategory = Object.fromEntries(monthlyTotals.map((item) => [item.category, item.total]));

  useEffect(() => {
    setDraftBudgets(budgets || {});
  }, [budgets]);

  function updateDraft(category, value) {
    setDraftBudgets((currentBudgets) => ({
      ...currentBudgets,
      [category]: value
    }));
  }

  return (
    <section className="panel budget-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Budgets</p>
          <h2>Monthly limits</h2>
        </div>
      </div>

      <div className="budget-list">
        {categories.map((category) => {
          const spent = totalsByCategory[category] || 0;
          const limit = Number(draftBudgets[category] || 0);
          const percentage = limit > 0 ? Math.min((spent / limit) * 100, 140) : 0;
          const isOverBudget = limit > 0 && spent > limit;

          return (
            <div className="budget-row" key={category}>
              <div className="budget-copy">
                <strong>{category}</strong>
                <span>
                  {formatCurrency(spent)} of {formatCurrency(limit)}
                </span>
              </div>
              <div className="budget-control">
                <div className="progress-track" aria-hidden="true">
                  <span
                    className={isOverBudget ? "over" : ""}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={draftBudgets[category] ?? ""}
                  onChange={(event) => updateDraft(category, event.target.value)}
                  aria-label={`${category} budget`}
                />
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onSaveBudget(category, Number(draftBudgets[category] || 0))}
                  disabled={isSaving}
                  title={`Save ${category} budget`}
                >
                  <Save size={16} aria-hidden="true" />
                  <span className="sr-only">Save {category} budget</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
