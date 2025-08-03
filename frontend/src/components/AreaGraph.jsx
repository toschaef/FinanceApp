import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { useContext, useMemo } from 'react';
import dayjs from 'dayjs';
import Context from '../Context';
import FilterGraph from './AreaFilter';

const AreaGraph = () => {
  const { graphData } = useContext(Context);

  /*
    sorts balances into seperate
    vaiables to allow the line to have 2 colors
  */
  const processedData = () => (
    graphData.map(d => {
      if (Number(d.balance == 0)) {
        return {
          ...d,
          greenBalance: 0,
          redBalance: 0
        }
      }
      return {
        ...d,
        greenBalance: d.color == 'g' ? d.balance : null,
        redBalance: d.color == 'r' ? d.balance : null,
    }}
  ));

  /*
    inserts points into graph data
    that force the grap to have a point
    with a balance equal to 0
  */
  const insertZeroCrossings = useMemo(() => {
    const data = processedData();
    return data.reduce((acc, curr, i) => {
      acc.push(curr);
      const next = data[i+1];
      if (!next) return acc;

      const a = curr.balance;
      const b = next.balance;

      // if this and next don't match up
      if ((a > 0 && b < 0) || (a < 0 && b > 0)) {
        const t = a / (a - b);
        const timeA = dayjs(curr.date).valueOf();
        const timeB = dayjs(next.date).valueOf();
        const interpolatedTime = timeA + t * (timeB - timeA);
        const interpolatedDate = dayjs(interpolatedTime).format('YYYY-MM-DD');

        // push date at exactly 0 to make graph pretty
        acc.push({
          date: interpolatedDate,
          greenBalance: 0,
          redBalance: 0,
          color: new Set(['g', 'r']),
        });
      }
      return acc;
    }, []);
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
    <div className='w-full flex flex-col'>
      <div className='h-[300px] mb-4'>
        <h3 className='flex my-3 text-align-center font-semibold text-xl'>Balance</h3>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart
            // graphData with color
            data={insertZeroCrossings}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 20,
            }}
          >
            <XAxis
              dataKey='date'
              tick={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              dataKey='balance'
              tickCount={3}
              domain={[yMin, yMax]}
              tickFormatter={v =>
                v.toLocaleString('en-US', {
                  style:    'currency',
                  currency: 'USD',
                }).replace('.00', '')
              }
              scale='linear'
            />
            <Tooltip
              labelFormatter={l => dayjs(l).format('MMMM D, YYYY')}
              formatter={(value, color) => {
                if ((color == 'greenBalance' || color == 'redBalance') && value !== null) {
                  return [
                    value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                    'Balance'
                  ];
                }
                return [null, null];
              }}
            />
            <ReferenceLine 
              y={0} 
              stroke='#000000' 
              strokeWidth={1}
              strokeDasharray='none'
            />
            <defs>
              <linearGradient id='colorPositive' x1='0' y1='0' x2='0' y2='100%'>
                <stop offset='15%'  stopColor='#12d900' stopOpacity={0.8} />
                <stop offset='50%' stopColor='#12d900' stopOpacity={0.6}   />
                <stop offset='85%' stopColor='#12d900' stopOpacity={0.4}   />
              </linearGradient>
              <linearGradient id='colorNegative' x1='0' y1='0' x2='0' y2='100%'>
                <stop offset='15%'  stopColor='#bd0000' stopOpacity={0.8} />
                <stop offset='50%' stopColor='#bd0000' stopOpacity={0.6}   />
                <stop offset='85%' stopColor='#bd0000' stopOpacity={0.4}   />
              </linearGradient>
            </defs>
            <Area
              animationEasing={'ease-out'}
              animationDuration={750}
              dataKey='greenBalance'
              dot={false}
              fill='url(#colorPositive)'
              stroke='#000000'
              strokeWidth={1}
              type='catmullRom'
            />
            <Area
              animationEasing={'ease-out'}
              animationDuration={750}
              dataKey='redBalance'
              dot={false}
              fill='url(#colorNegative)'
              stroke='#000000'
              strokeWidth={1}
              type='catmullRom'
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <FilterGraph />
    </div>
  );
}

export default AreaGraph;