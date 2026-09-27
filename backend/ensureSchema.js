import pool from './db.js';

// DrawSQL exported category names and item names as bigint, and pointed
// Income_or_Expense.name at User(id). The page stores both as text.
// user_fk is the user reference, so the name foreign key is removed.
export async function ensureSchema() {
  await pool.query(`
    ALTER TABLE "Income_or_Expense"
    DROP CONSTRAINT IF EXISTS income_or_expense_name_foreign
  `);
  await pool.query(`
    ALTER TABLE "Income_or_Expense"
    ALTER COLUMN name TYPE text USING name::text
  `);
  await pool.query(`
    ALTER TABLE "Categories"
    ALTER COLUMN category TYPE text USING category::text
  `);
}
