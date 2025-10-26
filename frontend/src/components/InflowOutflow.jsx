import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const periods = [
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: '3month' },
  { label: 'This Year', value: 'year' },
];

const getCutoffs = (period) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  let currentStart, prevStart, prevEnd;

  switch (period) {
    case '3month':
      currentStart = new Date(y, m - 2, 1);
      prevStart = new Date(y, m - 5, 1);
      prevEnd = new Date(y, m - 2, 0);
      break;
    case 'year':
      currentStart = new Date(y, 0, 1);
      prevStart = new Date(y - 1, 0, 1);
      prevEnd = new Date(y - 1, 11, 31);
      break;
    case 'month':
    default:
      currentStart = new Date(y, m, 1);
      prevStart = new Date(y, m - 1, 1);
      prevEnd = new Date(y, m, 0);
      break;
  }

  currentStart.setHours(0, 0, 0, 0);
  prevStart.setHours(0, 0, 0, 0);
  prevEnd.setHours(23, 59, 59, 999);

  return { currentStart, prevStart, prevEnd };
}

const filterByRange = (transactions, start, end = new Date()) => {
  return transactions.filter((t) => {
    if (!t.transaction_date) return false;

    const d = new Date(t.transaction_date);
    return d >= start && d <= end;
  });
}

const calcTotals = (transactions) => {
  let inflow = 0,
    outflow = 0;
  for (const t of transactions) {
    const amt = Number(t.amount);
    if (amt >= 0) inflow += amt;
    else outflow += Math.abs(amt);
  }
  return { inflow, outflow };
}

const percentChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}


const InflowOutflow = ({ user_transactions }) => {
  const [period, setPeriod] = useState('3month');

  const { inflow, outflow, inflowChange, outflowChange, chartData } = useMemo(() => {
    const { currentStart, prevStart, prevEnd } = getCutoffs(period);

    const currentPeriod = filterByRange(user_transactions, currentStart);
    const previousPeriod = filterByRange(user_transactions, prevStart, prevEnd);

    const currentTotals = calcTotals(currentPeriod);
    const previousTotals = calcTotals(previousPeriod);

    const inflowChange = percentChange(
      currentTotals.inflow,
      previousTotals.inflow
    );
    const outflowChange = percentChange(
      currentTotals.outflow,
      previousTotals.outflow
    );

    const grouped = {};
    for (const t of currentPeriod) {
      const date = t.transaction_date?.split('T')[0];
      if (!date) continue;

      if (!grouped[date]) grouped[date] = { date, inflow: 0, outflow: 0 };
      const amt = Number(t.amount);
      if (amt >= 0) grouped[date].inflow += amt;
      else grouped[date].outflow += Math.abs(amt);
    }

    return {
      inflow: currentTotals.inflow,
      outflow: currentTotals.outflow,
      inflowChange,
      outflowChange,
      chartData: Object.values(grouped),
    };
  }, [user_transactions, period]);

  const formatChange = (val) => {
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(1)}%`;
  };

  const changeColor = (val) =>
    val > 0 ? 'text-green-600' : val < 0 ? 'text-red-600' : 'text-gray-500';

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Inflow / Outflow
        </h3>

        <select
          className="appearance-auto bg-white border border-gray-300 py-1.5 px-3 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm text-xs transition-all duration-150"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          {periods.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-around text-center mb-6">
        <div>
          <p className="text-sm text-gray-500">Inflow</p>
          <p className="text-green-600 font-bold">
            ${Number(inflow || 0).toFixed(2)}
          </p>
          <p className={`text-xs ${changeColor(inflowChange)}`}>
            {formatChange(inflowChange)} from last period
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Outflow</p>
          <p className="text-red-600 font-bold">
            ${Number(outflow || 0).toFixed(2)}
          </p>
          <p className={`text-xs ${changeColor(outflowChange)}`}>
            {formatChange(outflowChange)} from last period
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Net</p>
          <p className="text-gray-700 font-bold">
            ${(inflow - outflow).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="date" hide />
            <YAxis />
            <Tooltip />
            <Bar dataKey="inflow" fill="#16a34a" />
            <Bar dataKey="outflow" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default InflowOutflow;