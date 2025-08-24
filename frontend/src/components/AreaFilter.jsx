import { useState, useEffect, useMemo, useContext } from 'react';
import { subDays, eachDayOfInterval, eachHourOfInterval, eachMinuteOfInterval, formatISO } from 'date-fns';
import Context from '../Context';

const FilterGraph = ({ accounts, investments, transactions, assets, timespan, onChange = () => {}, thumbnail }) => {
  const { state_transactions, state_investments, state_accounts, state_assets } = useContext(Context);
  const [advanced, setAdvanced] = useState(false);
  const [formData, setFormData] = useState({ 
    span: timespan? timespan : '30', 
    accounts: new Set(accounts.map(a => a.account_id)), 
    assets: new Set(assets.map(a => a.id))
  });

  const toggleAdv = () => {
    setAdvanced(a => !a);
  }

  const handleSelectChange = (e) => {
    setFormData(d => ({ ...d, span: e.target.value }));
  }

  const handleAccountToggle = e => {
    setFormData(d => {
      const next = new Set(d.accounts);
      e.target.checked ? next.add(e.target.name) : next.delete(e.target.name);
      return { ...d, accounts: next };
    });
  }

  const handleAssetToggle = e => {
    const id = Number(e.target.name);
    setFormData(d => {
      const next = new Set(d.assets);
      e.target.checked ? next.add(id) : next.delete(id);
      return { ...d, assets: next };
    });
  }

  const graphData = useMemo(() => {
    const { span, accounts: accSet, assets: asSet } = formData;

    // collect each relevant date
    const dateNums = (arr, key) => arr.map(item => +new Date(item[key]));
    const tDates = dateNums(transactions, 'transaction_date');
    const iDates = investments.flatMap(inv => dateNums(inv.transactions, 'transaction_date'));
    const aDates = dateNums(assets.filter(a => a.acquisition_date), 'acquisition_date');

    // get date window
    const end = new Date();
    const start =
      span === 'x' // if all time, pick oldest transaction/inv transaction date - 2 days
        ? subDays(new Date(Math.min(...tDates, ...iDates, ...aDates)), 2)
        : subDays(end, Number(span));

    let intervalFunc, dateKey, step, timespan = Number(span);

    if (timespan <= 1) { // 1 day
      intervalFunc = eachMinuteOfInterval;
      dateKey = (d) => formatISO(d).slice(0, 16);
      step = { minutes: 15 };
    } else if (timespan < 7) { // < 7 days
      intervalFunc = eachHourOfInterval;
      dateKey = (d) => formatISO(d).slice(0, 13);
      step = { hours: 1 };
    } else if (timespan <= 45) { // <= 45 days
      intervalFunc = eachHourOfInterval;
      dateKey = (d) => formatISO(d).slice(0, 13);
      step = { hours: 12 };
    } else { // > 1 week
      intervalFunc = eachDayOfInterval;
      dateKey = (d) => formatISO(d, { representation: 'date' });
    }

    // init every date in window
    const dates = {};
    intervalFunc({ start, end }, step).forEach(d => {
      const key = dateKey(d);
      dates[key] = { date: key, change: 0 };
    });

    state_transactions.forEach(t => {
      if (!accSet.has(t.account_id)) return;
      const key = dateKey(new Date(t.transaction_date));
      dates[key] && (dates[key].change += Number(t.amount));
    });

    state_investments.forEach(i => {
      if (!accSet.has(i.account_id)) return;
      i.transactions.forEach(it => {
        const key = dateKey(new Date(it.transaction_date));
        dates[key] && (dates[key].change += Number(it.amount));
      })
    });

    // sort dates asc
    const sorted = Object.values(dates).sort(
      (a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf()
    );

    let offsetBeforeWindow = 0;
    state_assets.forEach(a => {
      if (!asSet.has(a.id)) return;
      const acquired = a.acquisition_date && new Date(a.acquisition_date);
      
      if (!acquired || acquired < start) {
        // offset out of scope assets
        offsetBeforeWindow += Number(a.amount);
      } else if (acquired && acquired >= start && acquired <= end) {
        // add to day
        const key = dateKey(acquired);
        dates[key].change += Number(a.amount);
      }
    });

    let running = offsetBeforeWindow;
    sorted.forEach(d => {
      running += d.change;
      d.balance = running;
    });

    const actual = state_accounts
      .filter(ac => accSet.has(ac.account_id))
      .reduce((sum, ac) => sum + Number(ac.account_balance), 0)
      + state_assets
        .filter(as => asSet.has(as.id))
        .reduce((sum, as) => sum + Number(as.amount), 0);

    const delta = actual - running;

    // fix offset + add color
    sorted.forEach((p) => {
      p.balance += delta;
      p.color = Number(p.balance) < 0 ? 'r' : 'g';
    });
    return sorted;
  }, [formData, transactions, investments, accounts, assets]);

  useEffect(() => {
    onChange(graphData);
  }, [graphData, onChange]);

  // don't render if graph is a thumbnail
  if (thumbnail) return null;

  return (
    <form className='max-w-[800px] w-5/6 mx-auto p-2 flex flex-col items-center border border-gray-300 rounded-lg bg-white relative text-sm'>
      <div className='flex clex-col items-center w-full space-x-2'>
        <div className='relative flex-1'>
          <select
            value={formData.span}
            onChange={handleSelectChange}
            className='block w-full appearance-none bg-white border border-gray-300 py-1.5 px-2 pr-6 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-150'
          >
            <option value='x'>All Time</option>
            <option value='1'>1 Day</option>
            <option value='3'>3 Days</option>
            <option value='7'>1 Week</option>
            <option value='30'>1 Month</option>
            <option value='182'>6 Months</option>
            <option value='365'>1 Year</option>
            <option value='1095'>3 Years</option>
          </select>
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-700'>
            <svg className='h-4 w-4' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </div>
        </div>

        <button
          type='button'
          onClick={toggleAdv}
          className='flex-1 px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200'
        >
          {advanced? 'Hide' : 'Configure'}
        </button>
      </div>
    
      {advanced && (
        <fieldset className='w-full p-3 border border-gray-300 rounded-lg space-y-1 mt-2'>
          <legend className='font-medium text-gray-700 px-1 -ml-1'>Graph filters</legend>
          
          <div className='grid grid-cols-2 lg:grid-cols-3 gap-y-1 gap-x-2'>
            {state_accounts.map(acc => (
              <label key={acc.account_id} className='flex items-center space-x-2 text-gray-700'>
                <input
                  type='checkbox'
                  name={acc.account_id}
                  checked={formData.accounts.has(acc.account_id)}
                  onChange={handleAccountToggle}
                  className='form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out'
                />
                <span>{acc.account_name}</span>
              </label>
            ))}
            
            {state_assets.map(ast => (
              <label key={ast.id} className='flex items-center space-x-2 text-gray-700 sm:text-sm'>
                <input
                  type='checkbox'
                  name={ast.id}
                  checked={formData.assets.has(ast.id)}
                  onChange={handleAssetToggle}
                  className='form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out'
                />
                <span>{ast.asset_name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </form>
  );
};

export default FilterGraph;
