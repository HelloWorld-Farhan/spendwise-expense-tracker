import { CATEGORIES } from "../constants.js";
import { getMonthRange, isValidIsoDate } from "./date.js";

const VALID_RANGES = new Set(["all", "this-month", "last-month", "custom"]);

export function parseExpenseFilters(query = {}) {
  const category = query.category || "All";
  const range = query.range || "all";
  const errors = {};
  let startDate = null;
  let endDate = null;

  if (category !== "All" && !CATEGORIES.includes(category)) {
    errors.category = "Unknown category filter.";
  }

  if (!VALID_RANGES.has(range)) {
    errors.range = "Range must be all, this-month, last-month, or custom.";
  }

  if (range === "this-month") {
    ({ startDate, endDate } = getMonthRange(0));
  }

  if (range === "last-month") {
    ({ startDate, endDate } = getMonthRange(-1));
  }

  if (range === "custom") {
    startDate = query.startDate || "";
    endDate = query.endDate || "";

    if (!isValidIsoDate(startDate)) {
      errors.startDate = "Start date is required for a custom range.";
    }

    if (!isValidIsoDate(endDate)) {
      errors.endDate = "End date is required for a custom range.";
    }

    if (isValidIsoDate(startDate) && isValidIsoDate(endDate) && startDate > endDate) {
      errors.endDate = "End date must be after the start date.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    filters: {
      category,
      range,
      startDate,
      endDate
    }
  };
}

export function applyExpenseFilters(expenses, filters) {
  return expenses
    .filter((expense) => filters.category === "All" || expense.category === filters.category)
    .filter((expense) => {
      if (!filters.startDate || !filters.endDate) {
        return true;
      }

      return expense.date >= filters.startDate && expense.date <= filters.endDate;
    })
    .sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}
