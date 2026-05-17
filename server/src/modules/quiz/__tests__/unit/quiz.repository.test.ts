import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QueryResult, QueryResultRow } from "pg";

vi.mock("../../../../config/db.js", () => ({
  pool: {
    query: vi.fn(),
  },
}));

import { createQuiz, deleteQuizById, getQuizById } from "../../quiz.repository.js";
import { pool } from "../../../../config/db.js";

const quizRecord = {
  id: 1,
  title: "Daily Current Affairs Quiz",
  starts_at: new Date("2026-05-14T04:30:00.000Z"),
  ends_at: new Date("2026-05-14T04:45:00.000Z"),
  status_code: "published",
  created_at: new Date("2026-05-13T18:00:00.000Z"),
  updated_at: new Date("2026-05-13T18:00:00.000Z"),
} satisfies Awaited<ReturnType<typeof createQuiz>>;

const queryResult = <TRow extends QueryResultRow>(rows: TRow[]): QueryResult<TRow> => ({
  rows,
  rowCount: rows.length,
  command: "",
  oid: 0,
  fields: [],
});

const dbError = new Error("database failed");

describe("quiz repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should insert quiz and return created record", async () => {
    vi.mocked(pool.query as any).mockResolvedValue(queryResult([quizRecord]));

    const startsAt = new Date("2026-05-14T04:30:00.000Z");
    const endsAt = new Date("2026-05-14T04:45:00.000Z");

    const result = await createQuiz({
      title: "Test Quiz",
      startsAt,
      endsAt,
      statusCode: "published",
    });

    expect(pool.query).toHaveBeenCalledTimes(1);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO quizzes"),
      [
        "Test Quiz",
        startsAt,
        endsAt,
        "published",
      ]
    );

    expect(result).toEqual(quizRecord);
  });

  it("should resolve undefined when insert does not return a row", async () => {
    vi.mocked(pool.query as any).mockResolvedValue(queryResult([]));

    await expect(
      createQuiz({
        title: "Missing Result Quiz",
        startsAt: new Date("2026-05-14T04:30:00.000Z"),
        endsAt: new Date("2026-05-14T04:45:00.000Z"),
        statusCode: "published",
      })
    ).resolves.toBeUndefined();
  });

  it("should reject when creating quiz fails in database", async () => {
    vi.mocked(pool.query as any).mockRejectedValue(dbError);

    await expect(
      createQuiz({
        title: "Invalid Quiz",
        startsAt: new Date("2026-05-14T04:30:00.000Z"),
        endsAt: new Date("2026-05-14T04:45:00.000Z"),
        statusCode: "missing-status",
      })
    ).rejects.toThrow("database failed");
  });

  it("should get quiz by id", async () => {
    vi.mocked(pool.query as any).mockResolvedValue(queryResult([quizRecord]));

    await expect(getQuizById(quizRecord.id)).resolves.toEqual(quizRecord);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("JOIN quiz_statuses"),
      [quizRecord.id]
    );
  });

  it("should return null when quiz id does not exist", async () => {
    vi.mocked(pool.query as any).mockResolvedValue(queryResult([]));

    await expect(getQuizById(404)).resolves.toBeNull();
  });

  it("should reject when getting quiz by id fails in database", async () => {
    vi.mocked(pool.query as any).mockRejectedValue(dbError);

    await expect(getQuizById(quizRecord.id)).rejects.toThrow("database failed");
  });

  it("should delete quiz by id and return deleted id", async () => {
    const deletedQuiz = { id: quizRecord.id };

    vi.mocked(pool.query as any).mockResolvedValue(queryResult([deletedQuiz]));

    await expect(deleteQuizById(quizRecord.id)).resolves.toEqual(deletedQuiz);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      "DELETE FROM quizzes WHERE id = $1 RETURNING id",
      [quizRecord.id]
    );
  });

  it("should resolve undefined when deleting missing quiz", async () => {
    vi.mocked(pool.query as any).mockResolvedValue(queryResult([]));

    await expect(deleteQuizById(404)).resolves.toBeUndefined();
  });

  it("should reject when deleting quiz fails in database", async () => {
    vi.mocked(pool.query as any).mockRejectedValue(dbError);

    await expect(deleteQuizById(quizRecord.id)).rejects.toThrow("database failed");
  });
});
