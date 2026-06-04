import { ArrowDownUp, CalendarDays, ReceiptText, TrendingUp } from "lucide-react";
import { formatCurrency } from "../utils/formatters.js";

export default function SummaryCards({ summary }) {
  const cards = [
    {
      label: "Visible total",
      value: formatCurrency(summary.visibleTotal),
      icon: ArrowDownUp,
      tone: "green"
    },
    {
      label: "This month",
      value: formatCurrency(summary.totalSpentThisMonth),
      icon: CalendarDays,
      tone: "teal"
    },
    {
      label: "Highest expense",
      value: summary.highestSingleExpense
        ? formatCurrency(summary.highestSingleExpense.amount)
        : formatCurrency(0),
      icon: TrendingUp,
      tone: "amber"
    },
    {
      label: "Records",
      value: summary.count,
      icon: ReceiptText,
      tone: "rose"
    }
  ];

  return (
    <section className="summary-grid" aria-label="Expense summary">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article className="metric-card" key={card.label}>
            <div className={`metric-icon ${card.tone}`}>
              <Icon size={20} aria-hidden="true" />
            </div>
            <div>
              <p>{card.label}</p>
              <strong>{card.value}</strong>
            </div>
          </article>
        );
      })}
    </section>
  );
}
