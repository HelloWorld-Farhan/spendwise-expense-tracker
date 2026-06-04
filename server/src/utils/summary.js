import { CATEGORIES } from "../constants.js";
import { getMonthRange } from "./date.js";

function buildCategoryTotals(expenses, budgets) {
  return CATEGORIES.map((category) => {
    const matchingExpenses = expenses.filter((expense) => expense.category === category);
    const total = matchingExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const budget = Number(budgets[category] || 0);

    return {
      category,
      total: Math.round(total * 100) / 100,
      count: matchingExpenses.length,
      budget,
      isOverBudget: budget > 0 && total > budget
    };
  });
}

export function buildExpenseSummary(allExpenses, visibleExpenses, budgets) {
  const { startDate, endDate } = getMonthRange(0);
  const currentMonthExpenses = allExpenses.filter(
    (expense) => expense.date >= startDate && expense.date <= endDate
  );

  const highestSingleExpense = visibleExpenses.reduce((highest, expense) => {
    if (!highest || expense.amount > highest.amount) {
      return expense;
    }

    return highest;
  }, null);

  const visibleTotal = visibleExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const totalSpentThisMonth = currentMonthExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  return {
    count: visibleExpenses.length,
    visibleTotal: Math.round(visibleTotal * 100) / 100,
    totalSpentThisMonth: Math.round(totalSpentThisMonth * 100) / 100,
    highestSingleExpense,
    categoryTotals: buildCategoryTotals(visibleExpenses, budgets),
    currentMonthCategoryTotals: buildCategoryTotals(currentMonthExpenses, budgets)
  };
}
