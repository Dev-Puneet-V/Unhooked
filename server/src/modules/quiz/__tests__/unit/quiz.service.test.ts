import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../quiz.repository.js", () => ({
  createQuiz: vi.fn(),
  deleteQuizById: vi.fn(),
  getQuizById: vi.fn()
}));

const repository = await import("../../quiz.repository.js");
const service = await import("../../quiz.service.js");

const quizRecord = {
  id: 1,
  title: "Daily Current Affairs Quiz",
  starts_at: new Date("2026-05-14T04:30:00.000Z"),
  ends_at: new Date("2026-05-14T04:45:00.000Z"),
  status_code: "published",
  created_at: new Date("2026-05-13T18:00:00.000Z"),
  updated_at: new Date("2026-05-13T18:00:00.000Z")
};

describe("quiz service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a quiz and maps database fields to API fields", async () => {
    vi.mocked(repository.createQuiz).mockResolvedValue(quizRecord);

    await expect(
      service.createQuizForAdmin({
        title: quizRecord.title,
        startsAt: quizRecord.starts_at,
        endsAt: quizRecord.ends_at,
        statusCode: "published"
      })
    ).resolves.toEqual({
      id: quizRecord.id,
      title: quizRecord.title,
      startsAt: quizRecord.starts_at.toISOString(),
      endsAt: quizRecord.ends_at.toISOString(),
      status: quizRecord.status_code,
      createdAt: quizRecord.created_at.toISOString(),
      updatedAt: quizRecord.updated_at.toISOString()
    });
  });

  it("gets a quiz by id and maps database fiels to API fields", async () => {
    vi.mocked(repository.getQuizById).mockResolvedValue(quizRecord);
    await expect(
      service.getQuizByIdForUser(1)
    ).resolves.toEqual({
      id: quizRecord.id,
      title: quizRecord.title,
      startsAt: quizRecord.starts_at.toISOString(),
      endsAt: quizRecord.ends_at.toISOString(),
      status: quizRecord.status_code,
      createdAt: quizRecord.created_at.toISOString(),
      updatedAt: quizRecord.updated_at.toISOString()
    });
  });

  it("throws error if quiz id does not exist in the database", async () => {
    vi.mocked(repository.getQuizById).mockResolvedValue(null);
    await expect(service.getQuizByIdForUser(2)).rejects.toThrow("Resource not found");
  })

  it("deletes an existing quiz", async () => {
    vi.mocked(repository.deleteQuizById).mockResolvedValue({ id: quizRecord.id });

    await expect(service.deleteQuizForAdmin(quizRecord.id)).resolves.toBeUndefined();

    expect(repository.deleteQuizById).toHaveBeenCalledWith(quizRecord.id);
  });

  it("rejects deleting a missing quiz", async () => {
    vi.mocked(repository.deleteQuizById).mockResolvedValue(
      undefined as unknown as { id: number }
    );

    await expect(service.deleteQuizForAdmin(99)).rejects.toThrow("Quiz not found");
  });
});
