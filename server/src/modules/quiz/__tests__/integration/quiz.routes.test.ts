import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_ROLES } from "../../../auth/auth.constants.js";

vi.mock("../../../auth/auth.service.js", () => ({
  getAuthenticatedUser: vi.fn(),
  verifyAccessToken: vi.fn()
}));

vi.mock("../../quiz.service.js", () => ({
  createQuizForAdmin: vi.fn(),
  deleteQuizForAdmin: vi.fn(),
  getQuizByIdForUser: vi.fn()
}));

const authService = await import("../../../auth/auth.service.js");
const quizService = await import("../../quiz.service.js");
const { createApp } = await import("../../../../app.js");

const app = createApp();

const adminUser = {
  id: 1,
  email: "admin@unhooked.local",
  name: "Unhooked Admin",
  username: "unhookedadmin",
  role: AUTH_ROLES.admin
};

const normalUser = {
  ...adminUser,
  role: AUTH_ROLES.user
};

const quiz = {
  id: 1,
  title: "Daily Current Affairs Quiz",
  startsAt: "2026-05-14T04:30:00.000Z",
  endsAt: "2026-05-14T04:45:00.000Z",
  status: "published",
  createdAt: "2026-05-13T18:00:00.000Z",
  updatedAt: "2026-05-13T18:00:00.000Z"
};

describe("quiz admin routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.verifyAccessToken).mockReturnValue({
      userId: adminUser.id,
      sessionId: 1,
      deviceId: "device-id"
    });
    vi.mocked(authService.getAuthenticatedUser).mockResolvedValue(adminUser);
  });

  it("creates a quiz for admin users", async () => {
    vi.mocked(quizService.createQuizForAdmin).mockResolvedValue(quiz);

    const response = await request(app)
      .post("/api/v1/quizzes")
      .set("Authorization", "Bearer access-token")
      .send({
        title: quiz.title,
        startsAt: quiz.startsAt,
        endsAt: quiz.endsAt,
        statusCode: quiz.status
      })
      .expect(201);

    expect(quizService.createQuizForAdmin).toHaveBeenCalledWith({
      title: quiz.title,
      startsAt: new Date(quiz.startsAt),
      endsAt: new Date(quiz.endsAt),
      statusCode: quiz.status
    });
    expect(response.body).toEqual({ quiz });
  });

  it("blocks quiz creation for normal users", async () => {
    vi.mocked(authService.getAuthenticatedUser).mockResolvedValue(normalUser);

    const response = await request(app)
      .post("/api/v1/quizzes")
      .set("Authorization", "Bearer access-token")
      .send({
        title: quiz.title,
        startsAt: quiz.startsAt,
        endsAt: quiz.endsAt
      })
      .expect(403);

    expect(quizService.createQuizForAdmin).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      message: "You are not allowed to perform this action"
    });
  });

  it("deletes a quiz for admin users", async () => {
    vi.mocked(quizService.deleteQuizForAdmin).mockResolvedValue(undefined);

    await request(app)
      .delete("/api/v1/quizzes/1")
      .set("Authorization", "Bearer access-token")
      .expect(204);

    expect(quizService.deleteQuizForAdmin).toHaveBeenCalledWith(1);
  });

  it("gets a quiz for authenticated users", async () => {
    vi.mocked(quizService.getQuizByIdForUser).mockResolvedValue(quiz);

    const response = await request(app)
      .get("/api/v1/quizzes/1")
      .set("Authorization", "Bearer access-token")
      .expect(200);

    expect(quizService.getQuizByIdForUser).toHaveBeenCalledWith(1);
    expect(response.body).toEqual({ quiz });
  });

  it("rejects getting quiz with invalid id", async () => {
    const response = await request(app)
      .get("/api/v1/quizzes/abc")
      .set("Authorization", "Bearer access-token")
      .expect(400);

    expect(quizService.getQuizByIdForUser).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      message: "Quiz id is invalid"
    });
  });

  it("returns not found when quiz does not exist", async () => {
    vi.mocked(quizService.getQuizByIdForUser).mockRejectedValue(
      new Error("Resource not found")
    );

    const response = await request(app)
      .get("/api/v1/quizzes/99")
      .set("Authorization", "Bearer access-token")
      .expect(404);

    expect(response.body).toEqual({
      message: "Quiz not found"
    });
  });

  it("rejects deleting quiz with invalid id", async () => {
    const response = await request(app)
      .delete("/api/v1/quizzes/0")
      .set("Authorization", "Bearer access-token")
      .expect(400);

    expect(quizService.deleteQuizForAdmin).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      message: "Quiz id is invalid"
    });
  });

  it("returns not found when deleting missing quiz", async () => {
    vi.mocked(quizService.deleteQuizForAdmin).mockRejectedValue(new Error("Quiz not found"));

    const response = await request(app)
      .delete("/api/v1/quizzes/99")
      .set("Authorization", "Bearer access-token")
      .expect(404);

    expect(response.body).toEqual({
      message: "Quiz not found"
    });
  });

  it("requires auth for admin quiz routes", async () => {
    const response = await request(app).post("/api/v1/quizzes").expect(401);

    expect(response.body).toEqual({
      message: "Access token is required"
    });
  });
});
