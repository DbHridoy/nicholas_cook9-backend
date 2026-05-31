import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../src/shared/errors/app-error.js";
import { createDealerSchema, createUserSchema } from "../src/modules/users/user.schemas.js";

const repositoryMocks = vi.hoisted(() => ({
  existsByEmail: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  findMany: vi.fn(),
  deleteById: vi.fn(),
}));

const emailMocks = vi.hoisted(() => ({
  sendDealerWelcomePassword: vi.fn(),
  sendUserWelcomePassword: vi.fn(),
}));

const passwordMocks = vi.hoisted(() => ({
  createTemporaryPassword: vi.fn(),
}));

vi.mock("../src/modules/users/user.repository.js", () => ({
  userRepository: repositoryMocks,
}));

vi.mock("../src/modules/users/dealer-email.service.js", () => emailMocks);

vi.mock("../src/modules/users/password-generator.js", () => passwordMocks);

const { createDealer, createUser, listUsers } =
  await import("../src/modules/users/user.service.js");

describe("user service role-based creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    passwordMocks.createTemporaryPassword.mockReturnValue("TempPass123!");
  });

  it("creates an admin with a generated password and emails the password", async () => {
    const createdUser = {
      _id: "admin-id",
      name: "Admin One",
      email: "admin@example.com",
      role: "admin",
    };
    const publicUser = {
      _id: "admin-id",
      name: "Admin One",
      email: "admin@example.com",
      role: "admin",
      status: "active",
      createdBy: "super-admin-id",
    };

    repositoryMocks.existsByEmail.mockResolvedValue(null);
    repositoryMocks.create.mockResolvedValue(createdUser);
    repositoryMocks.findById.mockResolvedValue(publicUser);
    emailMocks.sendUserWelcomePassword.mockResolvedValue(undefined);

    await expect(
      createUser(
        { name: "Admin One", email: "admin@example.com", role: "admin" },
        "super-admin-id",
      ),
    ).resolves.toEqual(publicUser);

    expect(repositoryMocks.create).toHaveBeenCalledWith({
      name: "Admin One",
      email: "admin@example.com",
      role: "admin",
      password: "TempPass123!",
      createdBy: "super-admin-id",
    });
    expect(emailMocks.sendUserWelcomePassword).toHaveBeenCalledWith({
      email: "admin@example.com",
      name: "Admin One",
      role: "admin",
      temporaryPassword: "TempPass123!",
    });
    expect(repositoryMocks.deleteById).not.toHaveBeenCalled();
  });

  it("validates role-based user creation payloads", () => {
    const result = createUserSchema.safeParse({
      name: "Admin One",
      email: "admin@example.com",
      role: "admin",
      password: "ShouldNotBeAccepted123",
    });

    expect(result.success).toBe(false);
  });
});

describe("user service dealer creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    passwordMocks.createTemporaryPassword.mockReturnValue("TempPass123!");
  });

  it("creates a dealer with a generated password and emails the password", async () => {
    const createdUser = {
      _id: "dealer-id",
      name: "Dealer One",
      email: "dealer@example.com",
      role: "dealer",
    };
    const publicUser = {
      _id: "dealer-id",
      name: "Dealer One",
      email: "dealer@example.com",
      role: "dealer",
      status: "active",
      createdBy: "admin-id",
    };

    repositoryMocks.existsByEmail.mockResolvedValue(null);
    repositoryMocks.create.mockResolvedValue(createdUser);
    repositoryMocks.findById.mockResolvedValue(publicUser);
    emailMocks.sendDealerWelcomePassword.mockResolvedValue(undefined);

    await expect(
      createDealer({ name: "Dealer One", email: "dealer@example.com" }, "admin-id"),
    ).resolves.toEqual(publicUser);

    expect(repositoryMocks.create).toHaveBeenCalledWith({
      name: "Dealer One",
      email: "dealer@example.com",
      password: "TempPass123!",
      role: "dealer",
      createdBy: "admin-id",
    });
    expect(emailMocks.sendDealerWelcomePassword).toHaveBeenCalledWith({
      email: "dealer@example.com",
      name: "Dealer One",
      temporaryPassword: "TempPass123!",
    });
    expect(repositoryMocks.deleteById).not.toHaveBeenCalled();
  });

  it("rejects duplicate dealer email addresses", async () => {
    repositoryMocks.existsByEmail.mockResolvedValue({ _id: "existing-id" });

    await expect(
      createDealer({ name: "Dealer One", email: "dealer@example.com" }, "admin-id"),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "A user with this email already exists",
    });

    expect(repositoryMocks.create).not.toHaveBeenCalled();
    expect(emailMocks.sendDealerWelcomePassword).not.toHaveBeenCalled();
  });

  it("rolls back the dealer when the welcome email cannot be sent", async () => {
    repositoryMocks.existsByEmail.mockResolvedValue(null);
    repositoryMocks.create.mockResolvedValue({ _id: "dealer-id" });
    emailMocks.sendDealerWelcomePassword.mockRejectedValue(new Error("SMTP unavailable"));
    repositoryMocks.deleteById.mockResolvedValue({ _id: "dealer-id" });

    await expect(
      createDealer({ name: "Dealer One", email: "dealer@example.com" }, "admin-id"),
    ).rejects.toBeInstanceOf(AppError);

    expect(repositoryMocks.deleteById).toHaveBeenCalledWith("dealer-id");
  });

  it("validates dealer creation payloads", () => {
    const result = createDealerSchema.safeParse({
      name: "Dealer One",
      email: "dealer@example.com",
      password: "ShouldNotBeAccepted123",
      role: "admin",
    });

    expect(result.success).toBe(false);
  });
});

describe("user service listing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists admins and dealers for super admins", async () => {
    repositoryMocks.findMany.mockResolvedValue([]);

    await listUsers("super_admin");

    expect(repositoryMocks.findMany).toHaveBeenCalledWith({ role: { $ne: "super_admin" } });
  });

  it("lists dealers only for admins", async () => {
    repositoryMocks.findMany.mockResolvedValue([]);

    await listUsers("admin");

    expect(repositoryMocks.findMany).toHaveBeenCalledWith({ role: "dealer" });
  });
});
