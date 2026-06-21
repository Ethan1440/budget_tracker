import { useState } from 'react';

//This component is used to manage the categories for the income and expense lists. Allows for add and removal of income/expense category by type
//Takes in props: incomeCategories (array of strings), expenseCategories (array of strings), addIncomeCategory (function to call when income category is added), addExpenseCategory (function to call when expense category is added), removeIncomeCategory (function to call when income category is removed), removeExpenseCategory (function to call when expense category is removed)
function ManageCategories({ incomeCategories, expenseCategories, addIncomeCategory, addExpenseCategory, removeIncomeCategory, removeExpenseCategory }) {
    const [isFormOpen, setFormOpen] = useState(false); //State to control the form visibility. defaults to hidden.
    const [category, setCategory] = useState(''); //State to control the category input value. defaults to empty string.
    const [type, setType] = useState('income'); //State to control the type input value. defaults to income.

    const handleAdd = (e, type) => {
        e.preventDefault();
        if (type === 'income') {
            addIncomeCategory(category);
        } else if (type === 'expense') {
            addExpenseCategory(category);
        }
        setCategory('');
        setType('income'); //default to income type
        setFormOpen(false);
    }

    const handleRemove = (e, type, category) => {
        e.preventDefault();
        if (type === 'income') {
            removeIncomeCategory(category);
        } else if (type === 'expense') {
            removeExpenseCategory(category);
        }
    }

    const handleCancel = () => {
        setCategory('');
        setType('income'); //default to income type
        setFormOpen(false);
    }

    const toggleForm = (e) => {
        e.preventDefault();
        if (isFormOpen) {
            setCategory('');
            setType('income'); //default to income type
        }
        setFormOpen(isFormOpen => !isFormOpen); //acts like a toggle. if true, set to false. if false, set to true.
    }

    return (
        <div className="manage-categories">
            <button className={`manage-categories-btn`} onClick={(e) => toggleForm(e)}>+ Manaage Categories</button>
            {isFormOpen && <div className='manage-categories-form'>
                <form onSubmit={(e) => handleAdd(e, type)}>
                    <label htmlFor="category-input">New Category: </label>
                    <input id="category-input" type="text" value={category} onChange={(e) => setCategory(e.target.value)} required autoFocus />
                    <label htmlFor="category-input">Type: </label>
                    <select id="category-input" value={type} onChange={(e) => setType(e.target.value)} required>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                    <button type="submit">Add</button>
                    <button type="button" onClick={(e) => toggleForm(e)}>Cancel</button>
                </form>
                <ul className="manage-categories-list-income">
                    <h3>Income Categories</h3>
                    {incomeCategories.map(category => (
                        <li key={category}>{category} <button onClick={(e) => handleRemove(e, 'income', category)}>X</button></li>
                    ))}
                </ul>
                <ul className="manage-categories-list-expense">
                    <h3>Expense Categories</h3>
                    {expenseCategories.map(category => (
                        <li key={category}>{category} <button onClick={(e) => handleRemove(e, 'expense', category)}>X</button></li>
                    ))}
                </ul>
            </div>}
        </div>
    )
}

export default ManageCategories;