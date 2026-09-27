// HTML date inputs use YYYY-MM-DD; budget items store MM-DD-YYYY.
export function toMonthDayYear(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${month}-${day}-${year}`;
}

// Item dates are MM-DD-YYYY. month is 0-indexed (same as Date.getMonth()).
export function isInExpenseWindow(dateStr, month, year) {
  const [itemMonth, , itemYear] = dateStr.split('-');
  return parseInt(itemMonth, 10) - 1 === month && parseInt(itemYear, 10) === year;
}

// Non-recurring items only appear in the matching month/year. Recurring items appear in every window.
export function itemsForWindow(allItems, recurringItems, month, year) {
  const inWindow = allItems.filter((item) => !item.recurring && isInExpenseWindow(item.date, month, year));
  return [...inWindow, ...recurringItems];
}
