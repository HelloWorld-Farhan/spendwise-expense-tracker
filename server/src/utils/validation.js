import { CATEGORIES } from "../constants.js";
import { isValidIsoDate, todayIso } from "./date.js";

export function validateExpenseInput(body) {
  const errors = {};
  const amount = Number(body.amount);
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const note = body.note == null ? "" : String(body.note).trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Amount must be a positive number.";
  }

  if (!CATEGORIES.includes(category)) {
    errors.category = "Category is required and must be one of the supported values.";
  }

  if (!isValidIsoDate(date)) {
    errors.date = "Date must use the YYYY-MM-DD format.";
  } else if (date > todayIso()) {
    errors.date = "Date cannot be in the future.";
  }

  if (note.length > 180) {
    errors.note = "Note must be 180 characters or fewer.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      amount: Math.round(amount * 100) / 100,
      category,
      date,
      note
    }
  };
}

export function validateBudgetInput(body) {
  const errors = {};
  const limit = Number(body.limit);

  if (!Number.isFinite(limit) || limit < 0) {
    errors.limit = "Budget limit must be zero or a positive number.";
  }

  if (limit > 1000000) {
    errors.limit = "Budget limit must be 1,000,000 or less.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      limit: Math.round(limit * 100) / 100
    }
  };
}
