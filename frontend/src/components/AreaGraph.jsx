import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { useState, useContext, useMemo } from 'react';
import Context from '../Context';
import dayjs from 'dayjs';
import FilterGraph from './AreaFilter';

/**
 * 
 * @param {title} String - graph title
 * @param {timespan} String - graph timespan
 * @param {width} String - graph width
 * @param {accounts} Array - accounts in graph's scope
 * @param {investments} Array - investments in graph's scope
 * @param {transactions} Array - transactions in graph's scope
 * @param {assets} Array - assets in graph's scope
 * @param {thumbnail} Boolean - if true hide axis and tooltip
 * 
 */
const AreaGraph = ({ title, timespan, width, accounts, investments, transactions, assets, thumbnail }) => {
  const { isMobileView } = useContext(Context);
  const [graphData, setGraphData] = useState([]);

  const formatYTicker = (value) => {
    if (Math.abs(value) >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    } else if (Math.abs(value) >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}K`;
    }
    return `$${value}`; // small numbers as-is
  };

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

    if (thumbnail) {
      const range = dataMax - dataMin || 1;
      ymin -= range * 0.1;
    }

    return [ymin, ymax]
  }, [graphData]);

   const last = formattedGraphData[formattedGraphData.length - 1];

  const currentBalance = last
    ? last.greenBalance ?? last.redBalance
    : null;

  return (
    <div className='w-full h-full flex flex-col'>
      {/* graph header - titles and balance */}
      <div className='flex justify-between items-start mb-4'>
        <div className='flex flex-col'>
          {title &&
            <span className='pl-2 font-semibold md:text-xl sm:text-l text-sm text-gray-800'>{title}</span>
          }
          {/* {subtitle &&
            <span className='pl-2 font-medium sm:text-sm text-xs text-gray-500'>{subtitle}</span>
          } */}
        </div>
        
        {!thumbnail && currentBalance &&
          <span className={`font-semibold mr-4 mt-2 md:text-2xl sm:text-xl text-l ${currentBalance > 0? 'text-green-500' : 'text-red-400'}`}>
            {currentBalance.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              }).replace('.00', '')
            }
          </span>
        }
      </div>
      <div className='flex w-full flex-1 justify-center overflow-visible md:px-16 px-4'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart
              // graphData with color
              data={formattedGraphData}
              margin={{
                top:    thumbnail? 4 : isMobileView?  0 : 10,
                right:  thumbnail? 6 : isMobileView?  5 : 25,
                left:   thumbnail? 6 : isMobileView? 10 : 25,
                bottom: thumbnail? 0 : isMobileView?  0 : 20,
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
                tickFormatter={v => formatYTicker(v)}
                tick={{ fontSize: isMobileView? 10 : 15 }}
                scale='linear'
                width={isMobileView? 30 : 40}
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
                animationEasing={'ease-in'}
                animationDuration={300}
                dataKey='greenBalance'
                dot={false}
                fill='url(#colorPositive)'
                stroke='#000000'
                strokeWidth={1}
                type='catmullRom'
              />
              <Area
                animationEasing={'ease-in'}
                animationDuration={300}
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