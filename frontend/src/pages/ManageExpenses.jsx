import AddItemButton from '../components/addItemButton';
import ManageCategories from '../components/manageCategories';
import { useState } from 'react';

function ManageExpenses() {

    //States to store user data
    //Users have the ability to add income/expense items to state. All items must have an associated category.
    const [expenses, setExpense] = useState([]) //State to store list of user expenses. Each expense is an object with the following properties: { name: string, category: string, amount: number }
    const [income, setIncome] = useState([]) //State to store list of user income. Each income is an object with the following properties: { name: string, category: string, amount: number }
    const [incomeCategories, setIncomeCategories] = useState(['Salary', 'Investments', 'Gifts', 'Other']) //State to store list of user categories. Each category is an object with the following properties: { name: string, color: string }
    const [expenseCategories, setExpenseCategories] = useState(['Housing', 'Auto', 'Groceries', 'Social', 'Entertainment', 'Other']) //State to store list of user categories. Each category is an object with the following properties: { name: string, color: string }

    //Function will add an expense or income item to the state based on the type parameter.
    const addExpense_addIncome = (type, name, amount, category) => {
        //validate the category exists in income or expense categories
        if (type === 'expense' && expenseCategories.includes(category)) {
            setExpense([...expenses, { name, amount, category, date }]); //...expenses is the state of expenses before the new expense is added. then the update function is called and the new item added to the state var.
        } else if (type === 'income' && incomeCategories.includes(category)) {
            setIncome([...income, { name, amount, category, date }]);
        } else {
            alert('Invalid type. Please use "expense" or "income".');
            return;
        }
    } //end addExpense_addIncomes

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

    //Calc: total income - total expenses. To see what money is not allocated.
    //Known as derived state. State that is calculated from other state variables.
    //Runs on every render, and therefore maintains up to date calculations.
    const totalIncome = income.reduce((acc, item) => acc + Number(item.amount), 0);
    const totalExpenses = expenses.reduce((acc, item) => acc + Number(item.amount), 0);
    const netIncome = totalIncome - totalExpenses;

    return (
        <div className="manage-expenses">
            <div className="manage-expenses-header">
                <h1>Manage Expenses</h1>
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
                        {expenses.map(expense => { //reads income state and maps each item to a list. just name now for testing
                            return (
                                <li key={expense.name}>${expense.amount} - {expense.category}: {expense.name} - {expense.date}
                                    <buttton onClick={() => removeExpense_removeIncome('expense', expense.name)}>X</buttton>
                                </li>
                            )
                        })}
                    </ul>
                </section>
                <section className="manage-expenses-column income-column">
                    <h2>Income</h2>
                    <AddItemButton type="income" categories={incomeCategories} onAdd={addExpense_addIncome} />
                    <ul className="income-list">
                        {income.map(income => { //reads income state and maps each item to a list. just name now for testing
                            return (
                                <li key={income.name}>${income.amount} - {income.category}: {income.name} - {income.date}
                                    <buttton onClick={() => removeExpense_removeIncome('income', income.name)}>X</buttton>
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
