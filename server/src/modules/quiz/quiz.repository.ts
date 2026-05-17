import { pool } from "../../config/db.js";

export interface QuizRecord {
  id: number;
  title: string;
  starts_at: Date;
  ends_at: Date;
  status_code: string;
  created_at: Date;
  updated_at: Date;
}

export const createQuiz = async (params: {
  title: string;
  startsAt: Date;
  endsAt: Date;
  statusCode: string;
}) => {
  const result = await pool.query<QuizRecord>(
    `
      INSERT INTO quizzes (title, starts_at, ends_at, status_id)
      VALUES (
        $1,
        $2,
        $3,
        (SELECT id FROM quiz_statuses WHERE code = $4)
      )
      RETURNING
        quizzes.id,
        quizzes.title,
        quizzes.starts_at,
        quizzes.ends_at,
        (SELECT code FROM quiz_statuses WHERE quiz_statuses.id = quizzes.status_id) AS status_code,
        quizzes.created_at,
        quizzes.updated_at
    `,
    [params.title, params.startsAt, params.endsAt, params.statusCode]
  );

  return result.rows[0];
};

export const getQuizById =  async (id: number): Promise<QuizRecord | null> =>  {
  const result = await pool.query<QuizRecord>(
    `
      SELECT
        quizzes.id,
        quizzes.title,
        quizzes.starts_at,
        quizzes.ends_at,
        quiz_statuses.code AS status_code,
        quizzes.created_at,
        quizzes.updated_at
      FROM quizzes
      JOIN quiz_statuses ON quiz_statuses.id = quizzes.status_id
      WHERE quizzes.id = $1
    `,
    [id]
  );
  return result.rows[0] ?? null;
}

export const deleteQuizById = async (id: number) => {
  const result = await pool.query<{ id: number }>(
    "DELETE FROM quizzes WHERE id = $1 RETURNING id",
    [id]
  );

  return result.rows[0];
};
