import { describe, expect, it } from "vitest";

import { createQuizSchema } from "../../quiz.validation.js";

describe("quiz validation", () => {
  it("accepts valid quiz creation input", () => {
    const result = createQuizSchema.parse({
      title: "Daily Current Affairs Quiz",
      startsAt: "2026-05-14T04:30:00.000Z",
      endsAt: "2026-05-14T04:45:00.000Z",
      statusCode: "published"
    });

    expect(result).toEqual({
      title: "Daily Current Affairs Quiz",
      startsAt: new Date("2026-05-14T04:30:00.000Z"),
      endsAt: new Date("2026-05-14T04:45:00.000Z"),
      statusCode: "published"
    });
  });

  it("defaults quiz status to draft", () => {
    const result = createQuizSchema.parse({
      title: "Daily Current Affairs Quiz",
      startsAt: "2026-05-14T04:30:00.000Z",
      endsAt: "2026-05-14T04:45:00.000Z"
    });

    expect(result.statusCode).toBe("draft");
  });

  it("rejects invalid quiz windows", () => {
    expect(() =>
      createQuizSchema.parse({
        title: "Daily Current Affairs Quiz",
        startsAt: "2026-05-14T04:45:00.000Z",
        endsAt: "2026-05-14T04:30:00.000Z"
      })
    ).toThrow();
  });
});
