import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../src/shared/errors/app-error.js";
import {
  changePasswordSchema,
  createDealerSchema,
  createUserSchema,
} from "../src/modules/users/user.schemas.js";

const repositoryMocks = vi.hoisted(() => ({
  existsByEmail: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  findByIdWithPassword: vi.fn(),
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

const { changeMyPassword, createDealer, createUser, listUsers } =
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

describe("user service password changes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("changes the current user's password when the current password is correct", async () => {
    const user = {
      comparePassword: vi.fn().mockResolvedValue(true),
      save: vi.fn().mockResolvedValue(undefined),
      password: "hashed-current-password",
    };
    repositoryMocks.findByIdWithPassword.mockResolvedValue(user);

    await expect(
      changeMyPassword("user-id", {
        currentPassword: "current-password",
        newPassword: "new-password",
      }),
    ).resolves.toBeUndefined();

    expect(repositoryMocks.findByIdWithPassword).toHaveBeenCalledWith("user-id");
    expect(user.comparePassword).toHaveBeenCalledWith("current-password");
    expect(user.password).toBe("new-password");
    expect(user.save).toHaveBeenCalled();
  });

  it("rejects password changes when the account has no password set", async () => {
    const user = {
      comparePassword: vi.fn(),
      save: vi.fn(),
    };
    repositoryMocks.findByIdWithPassword.mockResolvedValue(user);

    await expect(
      changeMyPassword("user-id", {
        currentPassword: "current-password",
        newPassword: "new-password",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Password is not set for this account",
    });

    expect(user.comparePassword).not.toHaveBeenCalled();
    expect(user.save).not.toHaveBeenCalled();
  });

  it("returns a controlled error when password comparison fails", async () => {
    const user = {
      comparePassword: vi.fn().mockRejectedValue(new Error("Invalid hash")),
      save: vi.fn(),
      password: "invalid-hash",
    };
    repositoryMocks.findByIdWithPassword.mockResolvedValue(user);

    await expect(
      changeMyPassword("user-id", {
        currentPassword: "current-password",
        newPassword: "new-password",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Incorrect current password",
    });

    expect(user.save).not.toHaveBeenCalled();
  });

  it("rejects password changes when the current password is incorrect", async () => {
    const user = {
      comparePassword: vi.fn().mockResolvedValue(false),
      save: vi.fn(),
      password: "hashed-current-password",
    };
    repositoryMocks.findByIdWithPassword.mockResolvedValue(user);

    await expect(
      changeMyPassword("user-id", {
        currentPassword: "wrong-password",
        newPassword: "new-password",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Incorrect current password",
    });

    expect(user.save).not.toHaveBeenCalled();
  });

  it("validates password change payloads", () => {
    const validResult = changePasswordSchema.safeParse({
      currentPassword: "current-password",
      newPassword: "new-password",
    });
    const invalidResult = changePasswordSchema.safeParse({
      currentPassword: "short",
      newPassword: "new-password",
      unexpected: true,
    });

    expect(validResult.success).toBe(true);
    expect(invalidResult.success).toBe(false);
  });
});
