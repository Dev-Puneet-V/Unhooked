import type { z } from "zod";

import type { createQuizSchema } from "./quiz.validation.js";

export type CreateQuizRequestDto = z.infer<typeof createQuizSchema>;

export interface QuizDto {
  id: number;
  title: string;
  startsAt: string;
  endsAt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
