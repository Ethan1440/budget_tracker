import { Router } from 'express';
import pool from '../db.js';

const router = Router();

const USER_COLUMNS = 'id, name, email, created_at, updated_at';

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT ${USER_COLUMNS} FROM "User" ORDER BY id`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, password, email } = req.body ?? {};
    if (typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ error: 'name is required' });
      return;
    }
    if (typeof password !== 'string' || password === '') {
      res.status(400).json({ error: 'password is required' });
      return;
    }
    if (typeof email !== 'string' || email.trim() === '') {
      res.status(400).json({ error: 'email is required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO "User" (name, password, email, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING ${USER_COLUMNS}`,
      [name.trim(), Buffer.from(password, 'utf8'), email.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'A user with this name, password, and email already exists' });
      return;
    }
    next(error);
  }
});

export default router;
