import AddItemButton from '../components/addItemButton';
import ManageCategories from '../components/manageCategories';
import { useState } from 'react';
import React from 'react';

// HTML date inputs use YYYY-MM-DD; budget items store MM-DD-YYYY.
function toMonthDayYear(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${month}-${day}-${year}`;
}

// Check if item's month/year matches current month/year
function isCurrentMonth(dateStr) {
    // dateStr format: MM-DD-YYYY
    const [month, day, year] = dateStr.split('-');
    const itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
}

function ManageExpenses() {

    //States to store user data
    //Users have the ability to add income/expense items to state. All items must have an associated category.
    const [expenses, setExpense] = useState([]) //State to store list of user expenses. Each expense is an object with the following properties: { name: string, category: string, amount: number, date: string (MM-DD-YYYY) }
    const [income, setIncome] = useState([]) //State to store list of user income. Each income is an object with the following properties: { name: string, category: string, amount: number, date: string (MM-DD-YYYY) }
    const [incomeCategories, setIncomeCategories] = useState(['Salary', 'Investments', 'Gifts', 'Other']) //State to store list of user categories. Each category is an object with the following properties: { name: string, color: string }
    const [expenseCategories, setExpenseCategories] = useState(['Housing', 'Auto', 'Groceries', 'Social', 'Entertainment', 'Other', 'One Off Expense']) //State to store list of user categories. Each category is an object with the following properties: { name: string, color: string }
    const [currentDate, setCurrentDate] = useState(new Date()) //State to store the current date. Used to Check for expenses/income items witin the same month and year as the current date.
    const [recurringExpenses, setRecurringExpenses] = useState([]) //State to store list of user recurring expenses. Each expense is an object with the following properties: { name: string, category: string, amount: number, date: string (MM-DD-YYYY) }
    const [recurringIncome, setRecurringIncome] = useState([]) //State to store list of user recurring income. Each income is an object with the following properties: { name: string, category: string, amount: number, date: string (MM-DD-YYYY) }
    const [netIncome, setNetIncome] = useState(0) //State to store the net income. Calculated as total income - total expenses. Updated whenever income or expenses are added or removed.

    //Function will add an expense or income item to the state based on the type parameter.
    const addExpense_addIncome = (type, name, amount, category, date, recurring = false) => {
        //validate the category exists in income or expense categories
        const formattedDate = toMonthDayYear(date);
        //Expense/income item is unique by (name, category, date). If an item with the same name, category, and date already exists, do not add it again.
        if (type === 'expense' && expenseCategories.includes(category) && checkExpenseIncomeUnique(type, name, category, formattedDate)) {
            setExpense([...expenses, { name, amount, category, date: formattedDate, recurring }]); //...expenses is the state of expenses before the new expense is added. then the update function is called and the new item added to the state var.
        } else if (type === 'income' && incomeCategories.includes(category) && checkExpenseIncomeUnique(type, name, category, formattedDate)) {
            setIncome([...income, { name, amount, category, date: formattedDate, recurring }]);
        } else {
            alert('Item is not unique or category does not exist. Please check your inputs and try again.');
            return;
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

    //Builds list of recurring items. Recurring items appear every month. Non-recurring items only appear if month/year matches current date.
    const buildRecurringItems = (allIncome, allExpenses) => {
        const recurringIncomeItems = allIncome.filter(item => item.recurring === true);
        const recurringExpenseItems = allExpenses.filter(item => item.recurring === true);
        setRecurringIncome(recurringIncomeItems);
        setRecurringExpenses(recurringExpenseItems);
    }

    // useEffect to rebuild recurring items whenever income or expenses change
    React.useEffect(() => {
        buildRecurringItems(income, expenses);
    }, [income, expenses]);

    //remove items by name
    const removeExpense_removeIncome = (type, name) => {
        if (type === 'expense') {
            setExpense(expenses.filter(expense => expense.name !== name));
        } else if (type === 'income') {
            setIncome(income.filter(income => income.name !== name));
        } else {
            alert('Invalid type. Please use "expense" or "income".');
            return;
        }
    } //end removeExpense_removeIncome

    //manage income and expense categories
    const addIncomeCategory = (category) => {
        setIncomeCategories([...incomeCategories, category]);
    }

    const removeIncomeCategory = (category) => {
        setIncomeCategories(incomeCategories.filter(cat => cat !== category)); //filter out the category to remove from the list.
    }

    const addExpenseCategory = (category) => {
        setExpenseCategories([...expenseCategories, category]);
    }

    const removeExpenseCategory = (category) => {
        setExpenseCategories(expenseCategories.filter(cat => cat !== category)); //filter out the category to remove from the list.
    }

    const calculateNetIncome = (income, expenses, recurringIncome, recurringExpenses) => {
        const totalIncome = income.reduce((acc, item) => acc + Number(item.amount), 0);
        const totalExpenses = expenses.reduce((acc, item) => acc + Number(item.amount), 0);
        const totalRecurringIncome = recurringIncome.reduce((acc, item) => acc + Number(item.amount), 0);
        const totalRecurringExpenses = recurringExpenses.reduce((acc, item) => acc + Number(item.amount), 0);
        
        setNetIncome((totalIncome + totalRecurringIncome) - (totalExpenses + totalRecurringExpenses));
    }

    return (
        <div className="manage-expenses">
            <div className="manage-expenses-header">
                <h1>Manage Expenses</h1>
                <h2><span>Current Expense Window: {new Date().toLocaleDateString('en-US', { month: 'long' })}</span><span> Year {new Date().toLocaleDateString('en-US', { year: 'numeric' })}</span></h2>
                <h2>Date: {new Date().toLocaleDateString('en-US')}</h2>
            </div>
            <div className="manage-expenses-categories">
                <ManageCategories incomeCategories={incomeCategories} expenseCategories={expenseCategories} addIncomeCategory={addIncomeCategory} addExpenseCategory={addExpenseCategory} removeIncomeCategory={removeIncomeCategory} removeExpenseCategory={removeExpenseCategory} />
            </div>
            <div className="manage-expenses-net-income">{netIncome > 0 ? '+' : '-'}${Math.abs(netIncome)} Net Income</div>
            <div className="manage-expenses-columns">
                <section className="manage-expenses-column expenses-column">
                    <h2>Expenses</h2>
                    <AddItemButton type="expense" categories={expenseCategories} onAdd={addExpense_addIncome} />
                    <ul className="expenses-list">
                        {expenses.filter(e => e.recurring === false ? isCurrentMonth(e.date) : false).map(expense => { //reads expenses state and maps each item to a list for current month only
                            return (
                                <li key={expense.name}>${expense.amount} - {expense.category}: {expense.name} - {expense.date}
                                    <button style={{ paddingLeft: '10px', cursor: 'pointer', background: 'none', border: 'none' }} onClick={() => removeExpense_removeIncome('expense', expense.name)}><span style={{color: 'red'}}>X</span></button>
                                </li>
                            )
                        })}
                        {recurringExpenses.map(expense => { //reads recurring expenses state and maps each recurring item to a list
                            return (
                                <li key={expense.name}>${expense.amount} - {expense.category}: {expense.name} - {expense.date} (Recurring)
                                    <button style={{ paddingLeft: '10px', cursor: 'pointer', background: 'none', border: 'none' }} onClick={() => removeExpense_removeIncome('expense', expense.name)}><span style={{color: 'red'}}>X</span></button>
                                </li>
                            )
                        })}
                    </ul>
                </section>
                <section className="manage-expenses-column income-column">
                    <h2>Income</h2>
                    <AddItemButton type="income" categories={incomeCategories} onAdd={addExpense_addIncome} />
                    <ul className="income-list">
                        {income.filter(i => i.recurring === false ? isCurrentMonth(i.date) : false).map(incomeItem => { //reads income state and maps each item to a list for current month only
                            return (
                                <li key={incomeItem.name}>${incomeItem.amount} - {incomeItem.category}: {incomeItem.name} - {incomeItem.date}
                                    <button style={{ paddingLeft: '10px', cursor: 'pointer', background: 'none', border: 'none' }} onClick={() => removeExpense_removeIncome('income', incomeItem.name)}><span style={{color: 'red'}}>X</span></button>
                                </li>
                            )
                        })}
                        {recurringIncome.map(incomeItem => { //reads recurring income state and maps each recurring item to a list
                            return (
                                <li key={incomeItem.name}>${incomeItem.amount} - {incomeItem.category}: {incomeItem.name} - {incomeItem.date} (Recurring)
                                    <button style={{ paddingLeft: '10px', cursor: 'pointer', background: 'none', border: 'none' }} onClick={() => removeExpense_removeIncome('income', incomeItem.name)}><span style={{color: 'red'}}>X</span></button>
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
