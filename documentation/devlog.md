## Session 6/15/26
This session I am seting up requirements of the project and gettng the inital framework setup. Time permitting I will start thinking through what data needs to be stored and buildng the table structures.
A good first step is probably to not implement storage and focus building the react parts out so I fast track learning that part.

Architecturally think through storage of expenses and income items. Currently stored as objects {name, category amount, type}; type = income or expense. Eventually this will become how the data is stored in the DB.
Probably worth while to at least design the table structure such that data is being stored inteligently.

## Session 6/18/26
This session I will think about what data I want to store based on features speced, and make a ER diagram based on data.

## Session 6/20/26
This session I am trying to hook up the manage expenses state to the button, and get items rendering 
properly.

I realized there needs to be two category lists, one each for epenses and incomes.

I have made this work for the pre-defined categories. Next up:
- user item deletion
- user category management
- track expenses to a date
- set up recurring system