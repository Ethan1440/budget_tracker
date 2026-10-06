import AddItemButton from '../components/addItemButton';
import ExpenseWindowButton from '../components/expenseWindowButton';
import ManageCategories from '../components/manageCategories';
import { createCategory, createIncomeOrExpense, deleteIncomeOrExpense, getCategories, getIncomeOrExpenses, splitIncomeAndExpenses, toClientItem } from '../api/budgetApi';
import { itemsForWindow, MONTH_NAMES, toMonthDayYear } from '../budgetDates';
import { useBudgetWindow } from '../budgetWindow';
import { useEffect, useState } from 'react';

function ManageExpenses() {

    //States to store user data loaded from the API.
    //Users have the ability to add income/expense items. All items must have an associated category.
    const [expenses, setExpense] = useState([]) //Each expense: { id, name, category, amount, date (MM-DD-YYYY), recurring }
    const [income, setIncome] = useState([]) //Each income item: { id, name, category, amount, date (MM-DD-YYYY), recurring }
    const [categoryRows, setCategoryRows] = useState([]) //Rows from Categories. Names shown in the lists are derived below.
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const incomeCategories = categoryRows.filter((row) => row.income_category).map((row) => row.category)
    const expenseCategories = categoryRows.filter((row) => row.expense_category).map((row) => row.category)
    const { currentMonth, currentYear, setWindow } = useBudgetWindow()
    const longestMonthName = MONTH_NAMES.reduce((longest, name) => name.length > longest.length ? name : longest);
    const recurringExpenses = expenses.filter((item) => item.recurring === true)
    const recurringIncome = income.filter((item) => item.recurring === true)
    const currWindowExpenses = itemsForWindow(expenses, recurringExpenses, currentMonth, currentYear)
    const currWindowIncome = itemsForWindow(income, recurringIncome, currentMonth, currentYear)
    const windowIncomeTotal = currWindowIncome.reduce((total, item) => total + Number(item.amount), 0)
    const windowExpenseTotal = currWindowExpenses.reduce((total, item) => total + Number(item.amount), 0)
    const netIncome = Math.round((windowIncomeTotal - windowExpenseTotal) * 100) / 100

    //Function will add an expense or income item based on the type parameter.
    const addExpense_addIncome = async (type, name, amount, category, date, recurring = false) => {
        const formattedDate = toMonthDayYear(date);
        const isExpense = type === 'expense';
        const categoryNames = isExpense ? expenseCategories : incomeCategories;
        //Expense/income item is unique by (name, category, date). If an item with the same name, category, and date already exists, do not add it again.
        if ((type !== 'expense' && type !== 'income') || !categoryNames.includes(category) || !checkExpenseIncomeUnique(type, name, category, formattedDate)) {
            alert('Item is not unique or category does not exist. Please check your inputs and try again.');
            return false;
        }

        const categoryRow = categoryRows.find((row) => row.category === category && (isExpense ? row.expense_category : row.income_category));
        if (!categoryRow) {
            alert('Category does not exist. Please check your inputs and try again.');
            return false;
        }

        try {
            const created = await createIncomeOrExpense({
                name,
                category: categoryRow.id,
                amount: Number(amount),
                recurring,
                item_date: formattedDate,
            });
            const item = toClientItem(created);
            if (isExpense) {
                setExpense((items) => [...items, item]);
            } else {
                setIncome((items) => [...items, item]);
            }
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    } //end addExpense_addIncomes

    //returns true if unique, and false if not unique. Used to check for duplicate expense/income items.
    const checkExpenseIncomeUnique = (type, name, category, date) => {
        if (type === 'expense') {
            for (const expense of expenses) {
                if (expense.name === name && expense.category === category && expense.date === date) {
                    return false;
                }
            }

        } else if (type === 'income') {
            for (const incomeItem of income) {
                if (incomeItem.name === name && incomeItem.category === category && incomeItem.date === date) {
                    return false;
                }
            }
        }
        return true;
    }

    useEffect(() => {
        let cancelled = false;
        async function loadBudget() {
            try {
                const [categories, items] = await Promise.all([getCategories(), getIncomeOrExpenses()]);
                if (cancelled) {
                    return;
                }
                const split = splitIncomeAndExpenses(items);
                setCategoryRows(categories);
                setExpense(split.expenses);
                setIncome(split.income);
                setLoadError('');
            } catch (error) {
                if (!cancelled) {
                    setLoadError(error.message);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }
        loadBudget();
        return () => {
            cancelled = true;
        };
    }, []);

    const removeExpense_removeIncome = async (type, item) => {
        if (type !== 'expense' && type !== 'income') {
            alert('Invalid type. Please use "expense" or "income".');
            return;
        }
        try {
            await deleteIncomeOrExpense(item.id);
            if (type === 'expense') {
                setExpense((items) => items.filter((expense) => expense.id !== item.id));
            } else {
                setIncome((items) => items.filter((incomeItem) => incomeItem.id !== item.id));
            }
        } catch (error) {
            alert(error.message);
        }
    }

    //manage income and expense categories
    const addIncomeCategory = async (category) => {
        try {
            const created = await createCategory({
                category,
                income_category: true,
                expense_category: false,
            });
            setCategoryRows((rows) => [...rows, created]);
        } catch (error) {
            alert(error.message);
        }
    }

    const removeIncomeCategory = (category) => {
        // Removal stays on this page until a delete route exists.
        setCategoryRows((rows) => rows.filter((row) => row.category !== category || !row.income_category));
    }

    const addExpenseCategory = async (category) => {
        try {
            const created = await createCategory({
                category,
                income_category: false,
                expense_category: true,
            });
            setCategoryRows((rows) => [...rows, created]);
        } catch (error) {
            alert(error.message);
        }
    }

    const removeExpenseCategory = (category) => {
        setCategoryRows((rows) => rows.filter((row) => row.category !== category || !row.expense_category));
    }

    const itemSummary = (item) => {
        const summary = `$${item.amount} - ${item.category}: ${item.name}`;
        return item.recurring ? summary : `${summary} - ${item.date}`;
    }

    const handleExpenseWindowChange = (month, year) => {
        setWindow(month, year);
    }

    return (
        <div className="manage-expenses">
            <div className="manage-expenses-header">
                <h1>Manage Expenses</h1>
                <h2 className="expense-window-nav">
                    <ExpenseWindowButton updateState={handleExpenseWindowChange} direction='Previous' currentMonth={currentMonth} currentYear={currentYear} />
                    <span className="expense-window-month">
                        <span className="expense-window-month-sizer" aria-hidden="true">: {longestMonthName} {currentYear}</span>
                        <span className="expense-window-month-label">{MONTH_NAMES[currentMonth]} {currentYear}</span>
                    </span>
                    <ExpenseWindowButton updateState={handleExpenseWindowChange} direction='Next' currentMonth={currentMonth} currentYear={currentYear} />
                </h2>
                <h2 style={{paddingTop: '10px', paddingBottom: '10px'}}>Date: {new Date().toLocaleDateString('en-US')}</h2>
                {isLoading && <p>Loading budget data…</p>}
                {loadError && <p>{loadError}</p>}
            </div>
            <div className="manage-expenses-categories">
                <ManageCategories incomeCategories={incomeCategories} expenseCategories={expenseCategories} addIncomeCategory={addIncomeCategory} addExpenseCategory={addExpenseCategory} removeIncomeCategory={removeIncomeCategory} removeExpenseCategory={removeExpenseCategory} />
            </div>
            <div className={netIncome > 0 ? 'manage-expenses-net-income-positive' : netIncome < 0 ? 'manage-expenses-net-income-negative' : 'manage-expenses-net-income'}>{netIncome > 0 ? '+' : netIncome < 0 ? '-' : ''}${Math.abs(netIncome)} Net Income</div>
            <div className="manage-expenses-columns">
                <section className="manage-expenses-column expenses-column">
                    <h2>Expenses</h2>
                    <AddItemButton type="expense" categories={expenseCategories} onAdd={addExpense_addIncome} />
                    <ul className="expenses-list">
                        {currWindowExpenses.map(expense => { //reads expenses state and maps each item to a list for current month only
                            return (
                                <li key={expense.id}>{itemSummary(expense)}
                                    <button style={{ paddingLeft: '10px', cursor: 'pointer', background: 'none', border: 'none' }} onClick={() => removeExpense_removeIncome('expense', expense)}><span style={{color: 'red'}}>X</span></button>
                                </li>
                            )
                        })}
                    </ul>
                </section>
                <section className="manage-expenses-column income-column">
                    <h2>Income</h2>
                    <AddItemButton type="income" categories={incomeCategories} onAdd={addExpense_addIncome} />
                    <ul className="income-list">
                        {currWindowIncome.map(incomeItem => { //reads income state and maps each item to a list for current month only
                            return (
                                <li key={incomeItem.id}>{itemSummary(incomeItem)}
                                    <button style={{ paddingLeft: '10px', cursor: 'pointer', background: 'none', border: 'none' }} onClick={() => removeExpense_removeIncome('income', incomeItem)}><span style={{color: 'red'}}>X</span></button>
                                </li>
                            )
                        })}
                    </ul>
                </section>
            </div>
        </div>
    )
}

export default ManageExpenses;
