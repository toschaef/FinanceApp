import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import FilterGraph from './AreaFilter';

/*
  perams:
    title/subtitle - graph title/subtitle
    timespan - starting timespan of graph - default 30
    height - graph height: must be an absolute
    width - graph width or 100%
    accounts, investments, transactions, assets - context graphed on first render
    thumbnail (bool) - when true hide filter and axis, thumbnail view
*/
const AreaGraph = ({ title, subtitle, timespan, height, width, accounts, investments, transactions, assets, thumbnail }) => {
  const [graphData, setGraphData] = useState([]);
  /*
    sorts balances into seperate
    vaiables to allow the line to have 2 colors

    then

    inserts points into graph data
    that force the grap to have a point
    with a balance equal to 0
  */
  const formattedGraphData = useMemo(() => {
    // seperate balances into red and green to make bicolored graph
    const data = graphData.map(d => {
      if (d.balance == 0) {
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
    }});
    // add balance at exactly $0 to transition lines smoothly
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

  // returns bounds of graph
  const [yMin, yMax] = useMemo(() => {
    const balances = graphData.map(d => d.balance);
    const dataMin = Math.min(...balances);
    const dataMax = Math.max(...balances, 0);
    var ymin, ymax;

    // 10% bottom if negative balance
    if (dataMin < 0) {
      const buffer = dataMin !== 0? Math.abs(dataMin * 0.1) : 1;
      ymin = dataMin - buffer;
    } else {
      ymin = 0;
    }

    // 25% top
    const buffer = dataMax !== 0? Math.abs(dataMax * 0.25) : 1;
    ymax = dataMax + buffer;

    return [ymin, ymax]
  }, [graphData]);

  const dimensions = {
    height,
    width,
  }

   const last = formattedGraphData[formattedGraphData.length - 1];

  const currentBalance = last
    ? last.greenBalance ?? last.redBalance
    : null;

  return (
    <div className='w-full flex flex-col'>
      {/* graph header - titles and balance */}
      <div className='flex justify-between items-start mb-4'>
        <div className='flex flex-col'>
          {title &&
            <span className='font-semibold text-l text-gray-800'>{title}</span>
          }
          {subtitle &&
            <span className='font-medium text-sm text-gray-500'>{subtitle}</span>
          }
        </div>
        
        {!thumbnail && currentBalance &&
          <span className={`font-bold mr-4 mt-2 text-2xl ${currentBalance > 0? 'text-green-500' : 'text-red-400'}`}>
            {currentBalance.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              }).replace('.00', '')
            }
          </span>
        }
      </div>
      <div style={dimensions}>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart
            // graphData with color
            data={formattedGraphData}
            margin={{
              top: thumbnail? 0 : 4,
              right: thumbnail? 0 : 6,
              left: thumbnail? 0 : 2,
              bottom: 0,
            }}
          >
            <XAxis
              dataKey='date'
              tick={false}
              axisLine={false}
              hide={thumbnail}
            />
            <YAxis
              allowDecimals={false}
              dataKey='balance'
              tickCount={3}
              domain={[yMin, yMax]}
              tickFormatter={v =>
                v.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).replace('.00', '')
              }
              scale='linear'
              hide={thumbnail}
            />

            {!thumbnail && 
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
            }
            <ReferenceLine 
              y={0} 
              stroke='#000000' 
              strokeWidth={1}
              strokeDasharray='none'
            />
            <defs>
              <linearGradient id='colorPositive' x1='0' y1='0' x2='0' y2='100%'>
                <stop offset='15%'  stopColor='#12d900' stopOpacity={1} />
                <stop offset='50%' stopColor='#12d900' stopOpacity={0.9}   />
                <stop offset='85%' stopColor='#12d900' stopOpacity={0.7}   />
              </linearGradient>
              <linearGradient id='colorNegative' x1='0' y1='0' x2='0' y2='100%'>
                <stop offset='15%'  stopColor='#bd0000' stopOpacity={1} />
                <stop offset='50%' stopColor='#bd0000' stopOpacity={0.9}   />
                <stop offset='85%' stopColor='#bd0000' stopOpacity={0.7}   />
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
      <FilterGraph
        timespan={timespan}
        accounts={accounts}
        investments={investments}
        transactions={transactions}
        assets={assets}
        onChange={setGraphData}
        thumbnail={thumbnail}
      />
    </div>
  );
}

export default AreaGraph;