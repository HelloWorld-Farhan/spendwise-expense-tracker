import { Download, RotateCcw } from "lucide-react";

export default function Filters({ categories, filters, onChange, onReset, onExport, isExportDisabled }) {
  function updateField(field, value) {
    onChange({
      ...filters,
      [field]: value
    });
  }

  return (
    <section className="toolbar" aria-label="Expense filters">
      <label>
        <span>Category</span>
        <select value={filters.category} onChange={(event) => updateField("category", event.target.value)}>
          <option value="All">All</option>
          {categories.map((category) => (
            <option value={category} key={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Date range</span>
        <select value={filters.range} onChange={(event) => updateField("range", event.target.value)}>
          <option value="all">All dates</option>
          <option value="this-month">This month</option>
          <option value="last-month">Last month</option>
          <option value="custom">Custom</option>
        </select>
      </label>

      {filters.range === "custom" && (
        <div className="custom-range">
          <label>
            <span>Start</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
            />
          </label>
          <label>
            <span>End</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) => updateField("endDate", event.target.value)}
            />
          </label>
        </div>
      )}

      <div className="toolbar-actions">
        <button type="button" className="icon-button" onClick={onReset} title="Reset filters">
          <RotateCcw size={18} aria-hidden="true" />
          <span className="sr-only">Reset filters</span>
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={onExport}
          disabled={isExportDisabled}
        >
          <Download size={18} aria-hidden="true" />
          Export CSV
        </button>
      </div>
    </section>
  );
}
