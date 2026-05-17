import type { Request, Response } from "express";

import { createQuizForAdmin, deleteQuizForAdmin, getQuizByIdForUser } from "./quiz.service.js";
import { createQuizSchema } from "./quiz.validation.js";

export const createQuizController = async (req: Request, res: Response) => {
  try {
    const body = createQuizSchema.parse(req.body);
    const quiz = await createQuizForAdmin(body);

    res.status(201).json({
      quiz
    });
  } catch {
    res.status(400).json({
      message: "Quiz creation failed"
    });
  }
};


export const getQuizByIdController = async (req: Request, res: Response) => {
  try {
    const quizId = Number(req.params.id);

    if (!Number.isInteger(quizId) || quizId <= 0) {
      res.status(400).json({
        message: "Quiz id is invalid"
      });
      return;
    }

    const quiz = await getQuizByIdForUser(quizId);
    res.status(200).json({
      quiz
    })
  } catch(error: unknown) {
    res.status(404).json({
      message: "Quiz not found"
    })    
  }
}

export const deleteQuizController = async (req: Request, res: Response) => {
  try {
    const quizId = Number(req.params.id);

    if (!Number.isInteger(quizId) || quizId <= 0) {
      res.status(400).json({
        message: "Quiz id is invalid"
      });
      return;
    }

    await deleteQuizForAdmin(quizId);

    res.status(204).send();
  } catch {
    res.status(404).json({
      message: "Quiz not found"
    });
  }
};
