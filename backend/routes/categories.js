import { Router } from 'express';
import { CURRENT_USER_ID } from '../currentUser.js';
import pool from '../db.js';

const router = Router();

const CATEGORY_COLUMNS = 'id, category, income_category, expense_category, user_fk, created_at, updated_at';

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT ${CATEGORY_COLUMNS}
       FROM "Categories"
       WHERE user_fk = $1
       ORDER BY id`,
      [CURRENT_USER_ID]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { category, income_category, expense_category } = req.body ?? {};
    if (typeof category !== 'string' || category.trim() === '') {
      res.status(400).json({ error: 'category is required' });
      return;
    }
    if (typeof income_category !== 'boolean' || typeof expense_category !== 'boolean') {
      res.status(400).json({ error: 'income_category and expense_category must be booleans' });
      return;
    }
    if (!income_category && !expense_category) {
      res.status(400).json({ error: 'A category must be marked income, expense, or both' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO "Categories" (category, income_category, expense_category, user_fk, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING ${CATEGORY_COLUMNS}`,
      [category.trim(), income_category, expense_category, CURRENT_USER_ID]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23503' && error.constraint === 'fk_users_categories') {
      res.status(400).json({ error: 'User does not exist' });
      return;
    }
    next(error);
  }
});

export default router;
