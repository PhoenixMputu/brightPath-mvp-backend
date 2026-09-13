import { describe, expect, it, mock, spyOn } from "bun:test";
import request from "supertest";
import app from "../src/app";
import { authService } from "../src/services/auth.service";
import { schoolService } from "../src/services/school.service";
import { redisClient } from "../src/lib/redis";
import { emailService } from "../src/services/email.service";

describe("AuthController verifyOtp", () => {
  it("should set access_token and refresh_token cookies on successful verification", async () => {
    // Mock the authService.verifyOtp method
    const mockSchool = {
      id: "test-school-id",
      email: "test@example.com",
      status: "confirmed",
    };
    
    const verifyOtpSpy = spyOn(authService, "verifyOtp").mockImplementation(async () => {
      return {
        school: mockSchool as any,
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      };
    });

    const response = await request(app)
      .post("/api/auth/signup/verify-otp")
      .send({
        email: "test@example.com",
        otp: "123456",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Email verified successfully. School status updated to confirmed.");
    expect(response.body.data.email).toBe("test@example.com");

    // Check cookies
    const cookies = response.headers["set-cookie"];
    expect(cookies).toBeDefined();
    
    const accessTokenCookie = cookies.find((c: string) => c.startsWith("access_token="));
    const refreshTokenCookie = cookies.find((c: string) => c.startsWith("refresh_token="));

    expect(accessTokenCookie).toContain("access_token=mock-access-token");
    expect(accessTokenCookie).toContain("HttpOnly");
    
    expect(refreshTokenCookie).toContain("refresh_token=mock-refresh-token");
    expect(refreshTokenCookie).toContain("HttpOnly");

    // In development (default for tests unless set otherwise), secure should be false
    if (process.env.NODE_ENV === 'production') {
        expect(accessTokenCookie).toContain("Secure");
    } else {
        expect(accessTokenCookie).not.toContain("Secure");
    }

    verifyOtpSpy.mockRestore();
  });

  it("should generate valid JWT tokens in AuthService", async () => {
    const payload = { id: "test-id", email: "test@example.com" };
    const accessToken = authService.generateAccessToken(payload);
    const refreshToken = authService.generateRefreshToken(payload);

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    expect(typeof accessToken).toBe("string");
    expect(typeof refreshToken).toBe("string");
  });

  it("should NOT set cookies on failed verification", async () => {
    const verifyOtpSpy = spyOn(authService, "verifyOtp").mockImplementation(async () => {
      throw new Error("Invalid OTP");
    });

    const response = await request(app)
      .post("/api/auth/signup/verify-otp")
      .send({
        email: "test@example.com",
        otp: "wrong-otp",
      });

    expect(response.status).toBe(400);
    expect(response.headers["set-cookie"]).toBeUndefined();

    verifyOtpSpy.mockRestore();
  });
});

describe("Silent Refresh strategy", () => {
  it("should refresh tokens successfully with a valid refresh_token cookie", async () => {
    const refreshTokensSpy = spyOn(authService, "refreshTokens").mockImplementation(async () => {
      return {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      };
    });

    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", ["refresh_token=old-refresh-token"]);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Tokens refreshed successfully");

    const cookies = response.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.find((c: string) => c.startsWith("access_token=new-access-token"))).toBeDefined();
    expect(cookies.find((c: string) => c.startsWith("refresh_token=new-refresh-token"))).toBeDefined();

    refreshTokensSpy.mockRestore();
  });

  it("should return 401 if refresh token is missing", async () => {
    const response = await request(app).post("/api/auth/refresh");
    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe("Refresh token missing");
  });
});

describe("Auth Middleware (protect)", () => {
  it("should allow access with a valid access_token cookie", async () => {
    const verifyAccessTokenSpy = spyOn(authService, "verifyAccessToken").mockImplementation(() => {
      return { id: "test-id", email: "test@example.com" };
    });

    const response = await request(app)
      .get("/api/auth/me")
      .set("Cookie", ["access_token=valid-token"]);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe("test@example.com");

    verifyAccessTokenSpy.mockRestore();
  });

  it("should return 401 if access_token is missing", async () => {
    const response = await request(app).get("/api/auth/me");
    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe("Not authorized, token missing");
  });

  it("should return 401 and TOKEN_EXPIRED code if token is expired", async () => {
    const verifyAccessTokenSpy = spyOn(authService, "verifyAccessToken").mockImplementation(() => {
      const err = new Error("jwt expired");
      err.name = "TokenExpiredError";
      throw err;
    });

    const response = await request(app)
      .get("/api/auth/me")
      .set("Cookie", ["access_token=expired-token"]);

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("TOKEN_EXPIRED");
    expect(response.body.error.message).toBe("Token expired");

    verifyAccessTokenSpy.mockRestore();
  });
});

describe("Auth signup with password", () => {
  it("should successfully register a school with a password", async () => {
    const signupData = {
      name: "Test School",
      province_id: "550e8400-e29b-41d4-a716-446655440000",
      city: "Test City",
      governor: "Test Governor",
      email: "new-school@example.com",
      password: "securePassword123",
      phone: "1234567890",
      address: "123 Test St",
    };

    // Mock schoolService.createSchool
    const createSchoolSpy = spyOn(schoolService, "createSchool").mockImplementation(async (data) => {
      return {
        id: "new-id",
        name: data.name,
        email: data.email,
        status: "pending",
        password: data.password, // This should be hashed
      } as any;
    });

    // Mock redisClient.set
    const redisSetSpy = spyOn(redisClient, "set").mockImplementation(async () => "OK");

    // Mock emailService.sendOtpEmail
    const sendEmailSpy = spyOn(emailService, "sendOtpEmail").mockImplementation(async () => {});

    const response = await request(app)
      .post("/api/auth/signup")
      .send(signupData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("School registered successfully. Please verify your email with the OTP sent.");
    expect(response.body.data.email).toBe("new-school@example.com");

    // Verify password was hashed
    const calledData = createSchoolSpy.mock.calls[0][0];
    expect(calledData.password).not.toBe("securePassword123");
    expect(calledData.password).toMatch(/^\$/);

    createSchoolSpy.mockRestore();
    redisSetSpy.mockRestore();
    sendEmailSpy.mockRestore();
  });

  it("should return 400 if password is too short", async () => {
    const signupData = {
      name: "Test School",
      province_id: "550e8400-e29b-41d4-a716-446655440000",
      city: "Test City",
      governor: "Test Governor",
      email: "new-school@example.com",
      password: "short",
      phone: "1234567890",
      address: "123 Test St",
    };

    const response = await request(app)
      .post("/api/auth/signup")
      .send(signupData);

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe("Validation failed");
    expect(response.body.error.details[0].message).toBe("Password must be at least 8 characters long");
  });
});
