import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, category, income_category, expense_category, created_at, updated_at
       FROM "Categories"
       ORDER BY id`
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
      `INSERT INTO "Categories" (category, income_category, expense_category, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, category, income_category, expense_category, created_at, updated_at`,
      [category.trim(), income_category, expense_category]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
