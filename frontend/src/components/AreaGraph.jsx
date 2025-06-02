import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useContext } from 'react';
import dayjs from 'dayjs';
import Context from '../Context';
import AreaToggle from './AreaToggle';

const AreaGraph = () => {
  const { graphData } = useContext(Context);
  return (
    <>
    <ResponsiveContainer>
      <AreaChart
        width={500}
        height={300}
        data={graphData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date"
          tickFormatter={d => dayjs(d).format("MMM D")}
          minTickGap={20} 
        />
        <YAxis 
          tickFormatter={v => v.toLocaleString("en-US", { style: "currency", currency: "USD" })}
          width={90}
        />
        <Tooltip
          labelFormatter={l => dayjs(l).format("MMMM D, YYYY")}
          formatter={v => v.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        />
        <defs>
          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#2dc300" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#2dc300" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#12d900"
          strokeWidth={2}
          dot={false}
          fill="url(#colorBalance)"
        />
      </AreaChart>
    </ResponsiveContainer>
    <AreaToggle />
    </>
  );
}

export default AreaGraph;