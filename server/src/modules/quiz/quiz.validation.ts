import { z } from "zod";

export const createQuizSchema = z
  .object({
    title: z.string().trim().min(3).max(150),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    statusCode: z
      .enum(["draft", "published", "closed", "cancelled"])
      .default("draft")
  })
  .refine((value) => value.endsAt > value.startsAt, {
    message: "endsAt must be after startsAt",
    path: ["endsAt"]
  });
