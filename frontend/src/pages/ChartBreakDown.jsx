import { useState } from 'react';
import React from 'react';
import { PieChart, pieClasses } from '@mui/x-charts/PieChart';

function ChartBreakDown() {
    return (
        <div className="chart-breakdown">
            <PieChart
                width={500}
                height={500}
                series={[
                    {
                        arcLabel: (item) => `${item.value}`,
                        highlightScope: { fade: 'global', highlight: 'item' },
                        faded: { color: 'gray' },
                        outerRadius: 100,
                        data: [
                            { id: 0, value: 10, label: 'Expense' },
                            { id: 1, value: 20, label: 'Income' },
                        ]
                    }
                ]}
            />

            <PieChart
                width={500}
                height={500}
                series={[
                    {
                        arcLabel: (item) => `${item.value}`,
                        highlightScope: { fade: 'global', highlight: 'item' },
                        faded: { color: 'gray' },
                        outerRadius: 100,
                        data: [
                            { id: 0, value: 10, label: 'Housing' },
                            { id: 1, value: 20, label: 'Auto' },
                            { id: 2, value: 30, label: 'Groceries' },
                            { id: 3, value: 40, label: 'Social' },
                            { id: 4, value: 50, label: 'Entertainment' },
                            { id: 5, value: 60, label: 'Other' },
                            { id: 6, value: 70, label: 'One Off Expense' },
                            { id: 7, value: 20, label: 'Income' },
                        ]
                    }
                ]}
            />
        </div>
    )
}

export default ChartBreakDown;