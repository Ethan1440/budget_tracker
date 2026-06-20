import { useState } from 'react';

//This component is used to add a new item to the income or expense list
//Takes in props: type (income or expense), categories (array of strings), onAdd (function to call when item is added; calls ManageExpenses.addExpense_addIncome)
function AddItemButton({ type, categories, onAdd }) {
    const [isFormOpen, setFormOpen] = useState(false); //State to control the form visibility. defaults to hidden.
    const [name, setName] = useState(''); //State to control the (expense/income)name input value. defaults to empty string.
    const [category, setCategory] = useState(categories[0] ?? ''); //State to control the category input value. defaults to first item in categories array or empty string when categories is null.
    const [amount, setAmount] = useState(0.0); //State to control the amount input value. defaults` to empty string.

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(type, name, amount, category); //store state data in ManageExpenses using .addExpense_addIncome

        //reset the form
        setName('');
        setCategory(categories[0] ?? '');
        setAmount('');
        setFormOpen(false);

    } //TODO: Implement the form submission logic
    const handleCancel = () => {
        //reset the form
        setName('');
        setCategory(categories[0] ?? '');
        setAmount('');
        setFormOpen(false);
    } //Function to close the form

    return (
        <div className="add-item-container">
            <button className={`manage-expenses-add-${type}`} onClick={() => setFormOpen(true)}>{type === 'income' ? ('Add Income') : type === 'expense' ? ('Add Expense') : ('Error Invalid type prop')}</button>
            {isFormOpen && (
                <div className="add-item-form-container">
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="expense-input">{type === 'income' ? ('Income name: ') : type === 'expense' ? ('Expense name: ') : ('Error Invalid type prop')}</label>
                        <input id="expense-input" type="text" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
                        <label htmlFor="category-input">Category: </label>
                        <select id="category-input" value={category} onChange={(e) => setCategory(e.target.value)} required>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <label htmlFor="amount-input">Amount: </label>
                        <input id="amount-input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                        <button type="submit">Add</button>
                        <button type="button" onClick={handleCancel}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default AddItemButton;