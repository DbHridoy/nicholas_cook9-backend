import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../src/shared/errors/app-error.js";

const userRepositoryMocks = vi.hoisted(() => ({
  findByEmailWithPassword: vi.fn(),
  findById: vi.fn(),
}));

const refreshTokenRepositoryMocks = vi.hoisted(() => ({
  create: vi.fn(),
  findActiveByHash: vi.fn(),
  revokeByHash: vi.fn(),
}));

const tokenBlacklistRepositoryMocks = vi.hoisted(() => ({
  revoke: vi.fn(),
}));

vi.mock("../src/modules/users/user.repository.js", () => ({
  userRepository: userRepositoryMocks,
}));

vi.mock("../src/modules/auth/refresh-token.repository.js", () => ({
  refreshTokenRepository: refreshTokenRepositoryMocks,
}));

vi.mock("../src/modules/auth/token-blacklist.repository.js", () => ({
  tokenBlacklistRepository: tokenBlacklistRepositoryMocks,
}));

const authService = await import("../src/modules/auth/auth.service.js");
const { hashValue, signRefreshToken } = await import("../src/modules/auth/auth.utils.js");

const activeUser = {
  _id: {
    toString: () => "user-id",
  },
  name: "Super Admin",
  email: "admin@example.com",
  role: "super_admin",
  status: "active",
};

describe("auth service refresh tokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    refreshTokenRepositoryMocks.create.mockResolvedValue({});
    refreshTokenRepositoryMocks.revokeByHash.mockResolvedValue({});
  });

  it("returns and stores a refresh token during login", async () => {
    userRepositoryMocks.findByEmailWithPassword.mockResolvedValue({
      ...activeUser,
      comparePassword: vi.fn().mockResolvedValue(true),
    });

    const result = await authService.login({
      email: "admin@example.com",
      password: "ChangeMe123!",
    });

    expect(result.accessToken).toBeTypeOf("string");
    expect(result.refreshToken).toBeTypeOf("string");
    expect(result.refreshTokenExpiresAt).toBeInstanceOf(Date);
    expect(refreshTokenRepositoryMocks.create).toHaveBeenCalledWith({
      userId: "user-id",
      tokenHash: hashValue(result.refreshToken),
      expiresAt: result.refreshTokenExpiresAt,
    });
  });

  it("rotates refresh tokens", async () => {
    const oldRefreshToken = signRefreshToken({ id: "user-id" }).token;
    const oldRefreshTokenHash = hashValue(oldRefreshToken);

    refreshTokenRepositoryMocks.findActiveByHash.mockResolvedValue({
      user: {
        toString: () => "user-id",
      },
    });
    userRepositoryMocks.findById.mockResolvedValue(activeUser);

    const result = await authService.refreshToken({ refreshToken: oldRefreshToken });

    expect(result.accessToken).toBeTypeOf("string");
    expect(result.refreshToken).toBeTypeOf("string");
    expect(result.refreshToken).not.toEqual(oldRefreshToken);
    expect(refreshTokenRepositoryMocks.revokeByHash).toHaveBeenCalledWith(oldRefreshTokenHash);
    expect(refreshTokenRepositoryMocks.create).toHaveBeenCalledWith({
      userId: "user-id",
      tokenHash: hashValue(result.refreshToken),
      expiresAt: result.refreshTokenExpiresAt,
    });
  });

  it("rejects refresh tokens that are not active in storage", async () => {
    const refreshToken = signRefreshToken({ id: "user-id" }).token;
    refreshTokenRepositoryMocks.findActiveByHash.mockResolvedValue(null);

    await expect(authService.refreshToken({ refreshToken })).rejects.toBeInstanceOf(AppError);
    expect(userRepositoryMocks.findById).not.toHaveBeenCalled();
    expect(refreshTokenRepositoryMocks.create).not.toHaveBeenCalled();
  });
});
