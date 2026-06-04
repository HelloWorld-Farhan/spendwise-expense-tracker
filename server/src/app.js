import cors from "cors";
import express from "express";
import { randomUUID } from "crypto";
import { CATEGORIES } from "./constants.js";
import { applyExpenseFilters, parseExpenseFilters } from "./utils/filters.js";
import { buildExpenseSummary } from "./utils/summary.js";
import { validateBudgetInput, validateExpenseInput } from "./utils/validation.js";
import { createFileStore } from "./store/fileStore.js";

function sendValidationError(res, errors) {
  return res.status(400).json({
    message: "Please fix the highlighted fields.",
    errors
  });
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function createApp(options = {}) {
  const app = express();
  const store = createFileStore(options.dataFilePath);

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/categories", (_req, res) => {
    res.json({ data: CATEGORIES });
  });

  app.get(
    "/api/expenses",
    asyncHandler(async (req, res) => {
      const parsedFilters = parseExpenseFilters(req.query);

      if (!parsedFilters.isValid) {
        return sendValidationError(res, parsedFilters.errors);
      }

      const expenses = await store.getExpenses();
      const filteredExpenses = applyExpenseFilters(expenses, parsedFilters.filters);

      return res.json({
        data: filteredExpenses,
        meta: {
          count: filteredExpenses.length,
          filters: parsedFilters.filters
        }
      });
    })
  );

  app.post(
    "/api/expenses",
    asyncHandler(async (req, res) => {
      const validation = validateExpenseInput(req.body);

      if (!validation.isValid) {
        return sendValidationError(res, validation.errors);
      }

      const now = new Date().toISOString();
      const expense = {
        id: randomUUID(),
        ...validation.data,
        createdAt: now,
        updatedAt: now
      };

      const createdExpense = await store.createExpense(expense);
      return res.status(201).json({ data: createdExpense });
    })
  );

  app.put(
    "/api/expenses/:id",
    asyncHandler(async (req, res) => {
      const validation = validateExpenseInput(req.body);

      if (!validation.isValid) {
        return sendValidationError(res, validation.errors);
      }

      const updatedExpense = await store.updateExpense(req.params.id, {
        ...validation.data,
        updatedAt: new Date().toISOString()
      });

      if (!updatedExpense) {
        return res.status(404).json({ message: "Expense not found." });
      }

      return res.json({ data: updatedExpense });
    })
  );

  app.delete(
    "/api/expenses/:id",
    asyncHandler(async (req, res) => {
      const deletedExpense = await store.deleteExpense(req.params.id);

      if (!deletedExpense) {
        return res.status(404).json({ message: "Expense not found." });
      }

      return res.json({ data: deletedExpense });
    })
  );

  app.get(
    "/api/summary",
    asyncHandler(async (req, res) => {
      const parsedFilters = parseExpenseFilters(req.query);

      if (!parsedFilters.isValid) {
        return sendValidationError(res, parsedFilters.errors);
      }

      const [expenses, budgets] = await Promise.all([store.getExpenses(), store.getBudgets()]);
      const visibleExpenses = applyExpenseFilters(expenses, parsedFilters.filters);

      return res.json({
        data: buildExpenseSummary(expenses, visibleExpenses, budgets),
        meta: {
          filters: parsedFilters.filters
        }
      });
    })
  );

  app.get(
    "/api/budgets",
    asyncHandler(async (_req, res) => {
      const budgets = await store.getBudgets();
      return res.json({ data: budgets });
    })
  );

  app.put(
    "/api/budgets/:category",
    asyncHandler(async (req, res) => {
      const category = req.params.category;

      if (!CATEGORIES.includes(category)) {
        return res.status(404).json({ message: "Category not found." });
      }

      const validation = validateBudgetInput(req.body);

      if (!validation.isValid) {
        return sendValidationError(res, validation.errors);
      }

      const budgets = await store.updateBudget(category, validation.data.limit);
      return res.json({ data: budgets });
    })
  );

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found." });
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ message: "Something went wrong on the server." });
  });

  return app;
}
