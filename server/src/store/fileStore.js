import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { DEFAULT_BUDGETS } from "../constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_DATA = {
  expenses: [],
  budgets: DEFAULT_BUDGETS
};

export function getDefaultDataFilePath() {
  return path.join(__dirname, "..", "data", "db.json");
}

export function createFileStore(dataFilePath = getDefaultDataFilePath()) {
  async function ensureFile() {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });

    try {
      await fs.access(dataFilePath);
    } catch {
      await fs.writeFile(dataFilePath, JSON.stringify(DEFAULT_DATA, null, 2));
    }
  }

  async function readData() {
    await ensureFile();
    const raw = await fs.readFile(dataFilePath, "utf8");
    const parsed = JSON.parse(raw);

    return {
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      budgets: {
        ...DEFAULT_BUDGETS,
        ...(parsed.budgets || {})
      }
    };
  }

  async function writeData(data) {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
  }

  return {
    async getExpenses() {
      const data = await readData();
      return data.expenses;
    },

    async createExpense(expense) {
      const data = await readData();
      data.expenses.push(expense);
      await writeData(data);
      return expense;
    },

    async updateExpense(id, updates) {
      const data = await readData();
      const index = data.expenses.findIndex((expense) => expense.id === id);

      if (index === -1) {
        return null;
      }

      data.expenses[index] = {
        ...data.expenses[index],
        ...updates
      };

      await writeData(data);
      return data.expenses[index];
    },

    async deleteExpense(id) {
      const data = await readData();
      const index = data.expenses.findIndex((expense) => expense.id === id);

      if (index === -1) {
        return null;
      }

      const [deletedExpense] = data.expenses.splice(index, 1);
      await writeData(data);
      return deletedExpense;
    },

    async getBudgets() {
      const data = await readData();
      return data.budgets;
    },

    async updateBudget(category, limit) {
      const data = await readData();
      data.budgets = {
        ...DEFAULT_BUDGETS,
        ...data.budgets,
        [category]: limit
      };
      await writeData(data);
      return data.budgets;
    }
  };
}
