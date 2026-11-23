import pool from './db.js';
import { CURRENT_USER_ID } from './currentUser.js';

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
  // Categories created before user_fk existed have a null owner. They belong
  // to the only account until login can assign them per user.
  await pool.query(
    `UPDATE "Categories" SET user_fk = $1 WHERE user_fk IS NULL`,
    [CURRENT_USER_ID]
  );
}
