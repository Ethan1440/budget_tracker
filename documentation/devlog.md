## Session 6/15/26
This session I am seting up requirements of the project and gettng the inital framework setup. Time permitting I will start thinking through what data needs to be stored and buildng the table structures.
A good first step is probably to not implement storage and focus building the react parts out so I fast track learning that part.

Architecturally think through storage of expenses and income items. Currently stored as objects {name, category amount, type}; type = income or expense. Eventually this will become how the data is stored in the DB.
Probably worth while to at least design the table structure such that data is being stored inteligently.

## Session 6/18/26
This session I will think about what data I want to store based on features speced, and make a ER diagram based on data.

## Session 6/20/26
This session I am trying to hook up the manage expenses state to the button, and get items 
rendering properly. I also implemented category management (add/remove) as well as net income calcultion based on income and expense state. 

Note: Calculations with state variable in the react funtion return run whenever state 
changes. Such that variables such as netIncome can be using state and will always be up to 
date without tracking the calc seperately in a state variable.

I realized there needs to be two category lists, one each for epenses and incomes.

I have made this work for the pre-defined categories. Next up:
- add category deletion validation that prevents deletion of categories in use (either in 
income or expense category)
- track expenses to a date (think about how to make this quick, but also customizable)
- set up recurring system

## Session 8/24/26 
This session I am working towards the MVP, so I will pick up on the work from last time, and plan out a local backend I can use to save data. Time permitting I want to add a pie chart page that breaks down Income to expenses via pie charts.

-we are going to ignore the recurring system for now. I will just delete income and expense items as they change.