import type { CreateQuizRequestDto, QuizDto } from "./quiz.dto.js";
import {
  createQuiz,
  deleteQuizById,
  getQuizById,
  type QuizRecord
} from "./quiz.repository.js";

const toQuizDto = (quiz: QuizRecord): QuizDto => ({
  id: quiz.id,
  title: quiz.title,
  startsAt: quiz.starts_at.toISOString(),
  endsAt: quiz.ends_at.toISOString(),
  status: quiz.status_code,
  createdAt: quiz.created_at.toISOString(),
  updatedAt: quiz.updated_at.toISOString()
});

export const createQuizForAdmin = async (params: CreateQuizRequestDto) => {
  const quiz = await createQuiz(params);
  return toQuizDto(quiz);
};

export const getQuizByIdForUser = async (id: number) => {
  const quiz = await getQuizById(id);
  if(!quiz) {
    throw new Error('Resource not found');
  }
  return toQuizDto(quiz)
}

export const deleteQuizForAdmin = async (id: number) => {
  const deletedQuiz = await deleteQuizById(id);

  if (!deletedQuiz) {
    throw new Error("Quiz not found");
  }
};
