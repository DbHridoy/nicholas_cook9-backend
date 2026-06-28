import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("app routes", () => {
  it("responds on the root route", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        baseUrl: "/api/v1",
      },
    });
  });

  it("responds on the api v1 route", async () => {
    const response = await request(app).get("/api/v1");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        health: "/api/v1/health",
      },
    });
  });

  it("responds on the health route", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("validates login payloads", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "not-an-email",
      password: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("validates refresh token payloads", async () => {
    const response = await request(app).post("/api/v1/auth/refresh").send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("validates public claim submission payloads", async () => {
    const response = await request(app).post("/api/v1/claims").send({
      name: "A",
      email: "not-an-email",
      orderId: "",
      description: "short",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("requires authentication for user profile routes", async () => {
    const response = await request(app).get("/api/v1/users/me");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("requires authentication for daily sales routes", async () => {
    const response = await request(app).get("/api/v1/daily-sales");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("requires authentication for contract deletion routes", async () => {
    const response = await request(app).delete("/api/v1/contracts/contract-id");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("requires authentication for claim status update routes", async () => {
    const response = await request(app).patch("/api/v1/claims/claim-id/status").send({
      status: "approved",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
