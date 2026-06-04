# SpendWise Expense Tracker

## Project Title & Brief Description

SpendWise is my solution for **Exercise 2: Mini Expense Tracker** from the Studio Graphene Full Stack Developer assessment. It lets a single user add, view, edit, delete, filter, summarize, chart, budget, and export daily expenses through a React frontend and a Node.js/Express backend.

## Live Demo Links

- Frontend: https://spendwise-expense-tracker-client.vercel.app/
- Backend API: https://spendwise-expense-tracker-shc8.onrender.com

## Tech Stack

- **React + Vite**: fast frontend setup with functional components and hooks.
- **Plain CSS**: custom responsive UI without adding unnecessary styling complexity.
- **Recharts**: simple category spending bar chart.
- **Lucide React**: clean icons for actions and dashboard elements.
- **Node.js + Express**: REST API for expenses, summaries, categories, and budgets.
- **JSON file storage**: persists expenses and budgets across server restarts without a database setup.
- **Vitest + Supertest**: meaningful backend API tests for create, validation, update, and delete flows.

## How to Run Locally

Assume Node.js is installed.

```bash
npm install
npm run dev
```

Then open:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:5000/api/health`

Run backend tests:

```bash
npm test
```

Build the frontend:

```bash
npm run build
```

## API Documentation

### Health

`GET /api/health`

Response:

```json
{
  "status": "ok"
}
```

### Categories

`GET /api/categories`

Response:

```json
{
  "data": [
    "Food",
    "Transport",
    "Bills",
    "Entertainment",
    "Shopping",
    "Health",
    "Other"
  ]
}
```

### Get Expenses

`GET /api/expenses`

Optional query parameters:

- `category`: one category name, for example `Food`
- `range`: `all`, `this-month`, `last-month`, or `custom`
- `startDate`: required when `range=custom`, format `YYYY-MM-DD`
- `endDate`: required when `range=custom`, format `YYYY-MM-DD`

Response:

```json
{
  "data": [
    {
      "id": "exp_101",
      "amount": 1240.5,
      "category": "Food",
      "date": "2026-06-01",
      "note": "Weekly groceries",
      "createdAt": "2026-06-01T10:15:00.000Z",
      "updatedAt": "2026-06-01T10:15:00.000Z"
    }
  ],
  "meta": {
    "count": 1,
    "filters": {
      "category": "All",
      "range": "all",
      "startDate": null,
      "endDate": null
    }
  }
}
```

### Create Expense

`POST /api/expenses`

Request body:

```json
{
  "amount": 450,
  "category": "Food",
  "date": "2026-06-02",
  "note": "Lunch"
}
```

Response:

```json
{
  "data": {
    "id": "generated-id",
    "amount": 450,
    "category": "Food",
    "date": "2026-06-02",
    "note": "Lunch",
    "createdAt": "2026-06-02T12:00:00.000Z",
    "updatedAt": "2026-06-02T12:00:00.000Z"
  }
}
```

Validation errors use this shape:

```json
{
  "message": "Please fix the highlighted fields.",
  "errors": {
    "amount": "Amount must be a positive number."
  }
}
```

### Update Expense

`PUT /api/expenses/:id`

Request body:

```json
{
  "amount": 650,
  "category": "Transport",
  "date": "2026-06-01",
  "note": "Cab"
}
```

Response:

```json
{
  "data": {
    "id": "existing-id",
    "amount": 650,
    "category": "Transport",
    "date": "2026-06-01",
    "note": "Cab",
    "createdAt": "2026-06-01T09:00:00.000Z",
    "updatedAt": "2026-06-02T12:00:00.000Z"
  }
}
```

### Delete Expense

`DELETE /api/expenses/:id`

Response:

```json
{
  "data": {
    "id": "deleted-id",
    "amount": 650,
    "category": "Transport",
    "date": "2026-06-01",
    "note": "Cab"
  }
}
```

### Summary

`GET /api/summary`

Supports the same query parameters as `GET /api/expenses`.

Response:

```json
{
  "data": {
    "count": 4,
    "visibleTotal": 5230.5,
    "totalSpentThisMonth": 1240.5,
    "highestSingleExpense": {
      "id": "exp_103",
      "amount": 2450,
      "category": "Bills"
    },
    "categoryTotals": [
      {
        "category": "Food",
        "total": 1240.5,
        "count": 1,
        "budget": 12000,
        "isOverBudget": false
      }
    ],
    "currentMonthCategoryTotals": [
      {
        "category": "Food",
        "total": 1240.5,
        "count": 1,
        "budget": 12000,
        "isOverBudget": false
      }
    ]
  }
}
```

### Budgets

`GET /api/budgets`

Response:

```json
{
  "data": {
    "Food": 12000,
    "Transport": 6000
  }
}
```

`PUT /api/budgets/:category`

Request body:

```json
{
  "limit": 15000
}
```

Response:

```json
{
  "data": {
    "Food": 15000,
    "Transport": 6000
  }
}
```

## Project Structure

```text
.
├── client
│   ├── src
│   │   ├── components
│   │   │   ├── BudgetPanel.jsx
│   │   │   ├── CategoryChart.jsx
│   │   │   ├── ExpenseForm.jsx
│   │   │   ├── ExpenseTable.jsx
│   │   │   ├── Filters.jsx
│   │   │   └── SummaryCards.jsx
│   │   ├── utils
│   │   │   └── formatters.js
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server
│   ├── src
│   │   ├── data
│   │   │   └── db.json
│   │   ├── store
│   │   │   └── fileStore.js
│   │   ├── utils
│   │   │   ├── date.js
│   │   │   ├── filters.js
│   │   │   ├── summary.js
│   │   │   └── validation.js
│   │   ├── app.js
│   │   ├── constants.js
│   │   └── server.js
│   ├── tests
│   │   └── expenses.test.js
│   └── package.json
├── package.json
└── README.md
```

## What Works

- Add expenses with amount, category, date, and optional note.
- View expenses sorted by newest date first.
- Edit and delete expenses with confirmation before delete.
- Filter by category and date range.
- Summary cards show visible total, this month total, highest expense, and record count.
- Bar chart shows spending by category.
- Budgets persist and show monthly progress.
- Visible expenses export as CSV.
- Backend validation prevents negative amounts, unknown categories, future dates, and oversized notes.
- Data persists in `server/src/data/db.json`.

## Next Steps

- Add authentication if multiple users need separate data.
- Add pagination if the expense list grows very large.
- Add frontend component tests for the main user flows.
- Improve analytics with monthly and yearly spending trends.

## Manual Submission Process

1. Review the app locally with `npm run dev`.
2. Initialize Git if needed:

```bash
git init
git add package.json server/package.json server/src server/tests
git commit -m "Build Express expense API"
git add client/package.json client/index.html client/vite.config.js client/src
git commit -m "Build React expense dashboard"
git add README.md .gitignore
git commit -m "Add assessment documentation"
```

3. Create a public GitHub repository.
4. Connect the local folder to GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

5. Deploy the backend first. Render is a simple option:
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `npm start`
6. Deploy the frontend:
   - Root directory: `client`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
   - Add environment variable `VITE_API_BASE_URL=https://your-backend-url`
7. After deployment, update the README live demo links and commit that change.
8. Test the deployed frontend in an incognito/private browser window before submitting.

## Honesty Note

This project was built specifically for the assessment brief. No external tutorial project was copied.
