import fs from "fs/promises";
import os from "os";
import path from "path";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

let tempDirectory;
let app;

const seedData = {
  expenses: [
    {
      id: "expense-food",
      amount: 500,
      category: "Food",
      date: "2026-01-10",
      note: "Lunch",
      createdAt: "2026-01-10T10:00:00.000Z",
      updatedAt: "2026-01-10T10:00:00.000Z"
    },
    {
      id: "expense-bills",
      amount: 1200,
      category: "Bills",
      date: "2026-01-09",
      note: "Phone bill",
      createdAt: "2026-01-09T10:00:00.000Z",
      updatedAt: "2026-01-09T10:00:00.000Z"
    }
  ],
  budgets: {
    Food: 1000,
    Bills: 2000
  }
};

beforeEach(async () => {
  tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "spendwise-test-"));
  const dataFilePath = path.join(tempDirectory, "db.json");
  await fs.writeFile(dataFilePath, JSON.stringify(seedData, null, 2));
  app = createApp({ dataFilePath });
});

afterEach(async () => {
  await fs.rm(tempDirectory, { recursive: true, force: true });
});

describe("expense API", () => {
  it("creates an expense and returns it from the list", async () => {
    const createResponse = await request(app).post("/api/expenses").send({
      amount: 250,
      category: "Transport",
      date: "2026-01-11",
      note: "Metro card"
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data).toMatchObject({
      amount: 250,
      category: "Transport",
      date: "2026-01-11",
      note: "Metro card"
    });

    const listResponse = await request(app).get("/api/expenses");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data[0].note).toBe("Metro card");
  });

  it("rejects invalid expenses with useful field errors", async () => {
    const response = await request(app).post("/api/expenses").send({
      amount: -10,
      category: "",
      date: "not-a-date"
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.objectContaining({
        amount: expect.any(String),
        category: expect.any(String),
        date: expect.any(String)
      })
    );
  });

  it("updates and deletes an existing expense", async () => {
    const updateResponse = await request(app).put("/api/expenses/expense-food").send({
      amount: 650,
      category: "Food",
      date: "2026-01-10",
      note: "Team lunch"
    });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.amount).toBe(650);

    const deleteResponse = await request(app).delete("/api/expenses/expense-food");
    expect(deleteResponse.status).toBe(200);

    const listResponse = await request(app).get("/api/expenses");
    expect(listResponse.body.data).toHaveLength(1);
  });
});
