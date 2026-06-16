import { useState } from 'react';

//This component is used to add a new item to the income or expense list
//Takes in props: type (income or expense)
function AddItemButton({ type }) {
    const [isFormOpen, setFormOpen] = useState(false); //State to control the form visibility. defaults to hidden.
    const [text, setText] = useState(''); //State to control the input value. defaults to empty string.

    const handleSubmit = (e) => {
        e.preventDefault();
        setText('');

    } //TODO: Implement the form submission logic
    const handleCancel = () => { setFormOpen(false); } //Function to close the form

    return (
        <div className="add-item-container">
            <button className={`manage-expenses-add-${type}`} onClick={() => setFormOpen(true)}>{type === 'income' ? ('Add Income') : type === 'expense' ? ('Add Expense') : ('Error Invalid type prop')}</button>
            {isFormOpen && (
                <form onSubmit={handleSubmit}>
                    <label htmlFor="expense-input">{type === 'income' ? ('Income name: ') : type === 'expense' ? ('Expense name: ') : ('Error Invalid type prop')}</label>
                    <input id="expense-input" type="text" value={text} onChange={(e) => setText(e.target.value)} required autoFocus />
                    <button type="submit">Add</button>
                    <button type="button" onClick={handleCancel}>Cancel</button>
                </form>
            )}
        </div>
    );
}

export default AddItemButton;