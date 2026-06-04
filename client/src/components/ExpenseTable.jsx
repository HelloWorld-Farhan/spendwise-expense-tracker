import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/formatters.js";

export default function ExpenseTable({ expenses, onEdit, onDelete, isLoading }) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Records</p>
          <h2>Expenses</h2>
        </div>
      </div>

      {isLoading ? (
        <div className="skeleton-list" aria-label="Loading expenses">
          <span />
          <span />
          <span />
        </div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <strong>No expenses found</strong>
          <p>Try another filter or add your first spending record.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Note</th>
                <th className="amount-cell">Amount</th>
                <th className="action-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{formatDate(expense.date)}</td>
                  <td>
                    <span className={`category-pill ${expense.category.toLowerCase()}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td>{expense.note || "No note"}</td>
                  <td className="amount-cell">{formatCurrency(expense.amount)}</td>
                  <td className="action-cell">
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => onEdit(expense)}
                      title="Edit expense"
                    >
                      <Pencil size={17} aria-hidden="true" />
                      <span className="sr-only">Edit expense</span>
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      onClick={() => onDelete(expense)}
                      title="Delete expense"
                    >
                      <Trash2 size={17} aria-hidden="true" />
                      <span className="sr-only">Delete expense</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
