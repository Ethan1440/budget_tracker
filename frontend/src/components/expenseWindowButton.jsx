import { useState } from 'react';

function ExpenseWindowButton({ updateState, direction, currentMonth, currentYear }) {
    return (
        <button onClick={() => {
            if (direction === 'Previous') {
                if(currentMonth === 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                else{
                    currentMonth--;
                }
            {/** Direction next month, look for new year case */}
            } else {
                if(currentMonth === 11){
                    currentMonth = 0;
                    currentYear++;
                }
                else{
                    currentMonth++;
                }
            }
            updateState(currentMonth, currentYear);
        }}>
            {/* if direction is Previous, show '<' else show '>' */}
            <span>{direction === 'Previous' ? '<' : '>'}</span>
        </button>
    )
}

export default ExpenseWindowButton;