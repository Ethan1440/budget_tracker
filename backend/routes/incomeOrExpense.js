import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// Accounts are not wired up yet. Every new item belongs to this user.
const DEFAULT_USER_FK = 1;

const ITEM_SELECT = `
  SELECT i.id,
         i.user_fk,
         i.name,
         i.category,
         c.category AS category_name,
         c.income_category,
         c.expense_category,
         i.amount,
         i.recurring,
         i.item_date,
         i.created_at,
         i.updated_at
  FROM "Income_or_Expense" i
  LEFT JOIN "Categories" c ON c.id = i.category
`;

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(`${ITEM_SELECT} ORDER BY i.id`);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, category, amount, recurring, item_date } = req.body ?? {};
    if (typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ error: 'name is required' });
      return;
    }

    const categoryId = Number(category);
    if (!Number.isInteger(categoryId)) {
      res.status(400).json({ error: 'category must be a category id' });
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) {
      res.status(400).json({ error: 'amount must be a number' });
      return;
    }

    if (typeof recurring !== 'boolean') {
      res.status(400).json({ error: 'recurring must be a boolean' });
      return;
    }

    if (typeof item_date !== 'string' || item_date.trim() === '') {
      res.status(400).json({ error: 'item_date is required' });
      return;
    }

    const inserted = await pool.query(
      `INSERT INTO "Income_or_Expense"
         (user_fk, name, category, amount, recurring, item_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id`,
      [DEFAULT_USER_FK, name.trim(), categoryId, numericAmount, recurring, item_date.trim()]
    );

    const result = await pool.query(`${ITEM_SELECT} WHERE i.id = $1`, [inserted.rows[0].id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'An item with this name, category, and date already exists' });
      return;
    }
    if (error.code === '23503') {
      res.status(400).json({ error: 'Category does not exist' });
      return;
    }
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'id must be an integer' });
      return;
    }

    const result = await pool.query(
      `DELETE FROM "Income_or_Expense"
       WHERE id = $1 AND user_fk = $2
       RETURNING id`,
      [id, DEFAULT_USER_FK]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    res.json({ id: result.rows[0].id });
  } catch (error) {
    next(error);
  }
});

export default router;
