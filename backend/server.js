import cors from 'cors';
import express from 'express';
import { ensureSchema } from './ensureSchema.js';
import categoriesRouter from './routes/categories.js';
import incomeOrExpenseRouter from './routes/incomeOrExpense.js';
import usersRouter from './routes/users.js';

const PORT = Number(process.env.PORT ?? 3001);

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/income-or-expense', incomeOrExpenseRouter);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

ensureSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Budget API listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start the budget API', error);
    process.exit(1);
  });
