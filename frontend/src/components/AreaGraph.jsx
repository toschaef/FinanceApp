import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useContext, useMemo } from 'react';
import dayjs from 'dayjs';
import Context from '../Context';
import AreaToggle from './AreaToggle';

const AreaGraph = () => {
  const { graphData } = useContext(Context);
  const graphColor = useMemo(() => {
    if (graphData.length === 0) {
      return '#12d900'
    }
    if (graphData[graphData.length - 1].balance < 0) {
      return ['#bd0000', '#f78b8b'];
    } else {
      return ['#12d900', '#95f78b'];
    }
  }, [graphData]);
 
  const [yMin, yMax] = useMemo(() => {
    const balances = graphData.map(d => d.balance);
    const dataMin = Math.min(...balances);
    const dataMax = Math.max(...balances);
    var ymin, ymax;

    // 10% bottom if negative balance
    if (dataMin < 0) {
      const buffer = dataMin !== 0? Math.abs(dataMin * 0.1) : 1;
      ymin = dataMin + buffer;
    } else {
      ymin = 0;
    }

    // 10% top
    const buffer = dataMax !== 0? Math.abs(dataMax * 0.1) : 1;
    ymax = dataMax + buffer;

    return [ymin, ymax]
  }, [graphData]);

  return (
    <>
    <ResponsiveContainer width="100%" height={300}>
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
          dataKey="balance"
          domain={[yMin, yMax]}
          tickFormatter={v =>
            v.toLocaleString("en-US", {
              style:    "currency",
              currency: "USD",
            })
          }
          width={90}
        />
        <Tooltip
          labelFormatter={l => dayjs(l).format("MMMM D, YYYY")}
          formatter={v => v.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        />
        <defs>
          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="15%"  stopColor={graphColor[0]} stopOpacity={0.85} />
            <stop offset="85%" stopColor={graphColor[1]} stopOpacity={0.85}   />
          </linearGradient>
        </defs>
        <Area
          type="natural"
          dataKey="balance"
          stroke={graphColor}
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