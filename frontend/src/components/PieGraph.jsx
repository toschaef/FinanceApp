import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo, useState } from 'react';
import PieFilter from './PieFilter';

const colors = [
  '#2E7D32', '#1565C0', '#FF8F00', '#6A1B9A', '#00897B',
  '#C62828', '#AD1457', '#0277BD', '#F57C00', '#558B2F',
];

const Legend = ({ data }) => (
  <div className='w-1/3 flex-shrink-0 md:max-h-1/2 max-h-full overflow-y-auto border rounded-md p-2'>
    <div className='grid grid-cols-1 gap-y-2 gap-x-4'>
      {data.map((entry) => (
        <div key={entry.name} className='flex items-center gap-3 min-w-0'>
          <div
            className='w-3 h-3 rounded-full flex-shrink-0'
            style={{ backgroundColor: entry.color }}
          />
          <div className='flex flex-col truncate text-sm'>
            <span className='text-gray-800 font-medium truncate'>{entry.name}</span>
            <span className='text-gray-500'>
              {Number(entry.value).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const __Tooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const formattedValue = Number(data.value).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    return (
      <div className='p-2 bg-white border rounded-md shadow-lg'>
        <p className='text-gray-700 font-semibold'>{`${data.name}`}</p>
        <p className='text-gray-500'>{`${formattedValue}`}</p>
      </div>
    );
  }

  return null;
};

const PieGraph = ({ title, height, accounts, thumbnail }) => {
  const [graphData, setGraphData] = useState([]);

  const categoryData = useMemo(() => {
    const grouped = {};
    graphData.forEach((t) => {
      if (!t.finance_category || t.amount < 0) return;
      const category = t.finance_category;
      grouped[category] = (grouped[category] || 0) + Math.abs(t.amount || 0);
    });

    return Object.keys(grouped)
      .map((cat, i) => ({
        name: cat,
        value: grouped[cat],
        color: colors[i % colors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [graphData]);

  return (
    <div className='w-full h-full flex flex-col bg-white rounded-lg shadow-sm p-4 min-h-0'>
      {/* title */}
      {title && (
        <div className='flex-shrink-0 text-center mb-4'>
          <h2 className='text-xl sm:text-2xl font-semibold text-gray-700'>
            {title}
          </h2>
        </div>
      )}

      <div className='flex flex-col flex-1 min-h-0'>
        {/* chart + legend */}
        <div className='flex flex-row gap-6 flex-1 min-h-0 overflow-hidden'>
          <div className='w-2/3 flex-grow min-h-0'>
            {categoryData.length === 0 ? (
              <div className='h-full flex items-center justify-center text-gray-500'>
                No spending data for the selected period.
              </div>
            ) : (
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey='value'
                    nameKey='name'
                    cx='50%'
                    cy='50%'
                    height={height}
                    innerRadius='30%'
                    outerRadius='80%'
                    paddingAngle={2}
                    labelLine={false}
                    label={false}
                  >
                    {categoryData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} stroke={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<__Tooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {!thumbnail && <Legend data={categoryData} />}
        </div>

        {/* filter */}
        {!thumbnail && (
          <div className='mt-4 overflow-y-auto max-h-64'>
            <PieFilter accounts={accounts} onChange={setGraphData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PieGraph;