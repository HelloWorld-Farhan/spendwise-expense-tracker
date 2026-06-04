import { Check, CirclePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { todayIso } from "../utils/formatters.js";

const emptyForm = {
  amount: "",
  category: "",
  date: todayIso(),
  note: ""
};

export default function ExpenseForm({ categories, editingExpense, onSubmit, onCancelEdit, isSaving }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingExpense) {
      setForm({
        amount: String(editingExpense.amount),
        category: editingExpense.category,
        date: editingExpense.date,
        note: editingExpense.note || ""
      });
      setErrors({});
      return;
    }

    setForm((currentForm) => ({
      ...emptyForm,
      category: currentForm.category || categories[0] || ""
    }));
  }, [editingExpense, categories]);

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: ""
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.amount || Number(form.amount) <= 0) {
      nextErrors.amount = "Enter a positive amount.";
    }

    if (!form.category) {
      nextErrors.category = "Choose a category.";
    }

    if (!form.date) {
      nextErrors.date = "Choose a date.";
    }

    if (form.date > todayIso()) {
      nextErrors.date = "Date cannot be in the future.";
    }

    if (form.note.length > 180) {
      nextErrors.note = "Keep the note under 180 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      note: form.note.trim()
    });

    if (!editingExpense) {
      setForm({
        ...emptyForm,
        category: form.category
      });
    }
  }

  return (
    <section className="panel form-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Expense</p>
          <h2>{editingExpense ? "Edit record" : "Add record"}</h2>
        </div>
        {editingExpense && (
          <button type="button" className="icon-button" onClick={onCancelEdit} title="Cancel edit">
            <X size={18} aria-hidden="true" />
            <span className="sr-only">Cancel edit</span>
          </button>
        )}
      </div>

      <form className="expense-form" onSubmit={handleSubmit}>
        <label>
          <span>Amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(event) => updateField("amount", event.target.value)}
            placeholder="1250"
          />
          {errors.amount && <small>{errors.amount}</small>}
        </label>

        <label>
          <span>Category</span>
          <select value={form.category} onChange={(event) => updateField("category", event.target.value)}>
            <option value="" disabled>
              Select category
            </option>
            {categories.map((category) => (
              <option value={category} key={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <small>{errors.category}</small>}
        </label>

        <label>
          <span>Date</span>
          <input
            type="date"
            max={todayIso()}
            value={form.date}
            onChange={(event) => updateField("date", event.target.value)}
          />
          {errors.date && <small>{errors.date}</small>}
        </label>

        <label>
          <span>Note</span>
          <textarea
            rows="4"
            value={form.note}
            onChange={(event) => updateField("note", event.target.value)}
            placeholder="Short note"
          />
          {errors.note && <small>{errors.note}</small>}
        </label>

        <button type="submit" className="button primary" disabled={isSaving}>
          {editingExpense ? <Check size={18} aria-hidden="true" /> : <CirclePlus size={18} aria-hidden="true" />}
          {isSaving ? "Saving..." : editingExpense ? "Save changes" : "Add expense"}
        </button>
      </form>
    </section>
  );
}
