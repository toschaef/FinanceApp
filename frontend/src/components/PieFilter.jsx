import { useState, useEffect, useContext } from 'react';
import { subDays } from 'date-fns';
import Context from '../Context';

const PieFilter = ({ accounts, onChange, thumbnail }) => {
  const { state_transactions } = useContext(Context);

  const [advanced, setAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    span: '30',
    accounts: accounts.map(a => a.account_id)
  });

  const toggleAdv = () => setAdvanced(a => !a);

  const handleSelectChange = (e) => {
    setFormData(d => ({ ...d, span: e.target.value }));
  };

  const handleAccountToggle = (e) => {
    setFormData(d => {
      const { name, checked } = e.target;
      const next = checked
        ? [...d.accounts, name]
        : d.accounts.filter(id => id !== name);
      return { ...d, accounts: next };
    });
  };

  useEffect(() => {
    const { span, accounts: accArray } = formData;
    const accSet = new Set(accArray);

    const end = new Date();
    const start = span === 'x'
      ? new Date(0)
      : subDays(end, Number(span));

    const filtered = state_transactions.filter(t =>
      accSet.has(t.account_id) &&
      new Date(t.transaction_date) >= start &&
      new Date(t.transaction_date) <= end
    );

    onChange(filtered);
  }, [formData, state_transactions, onChange]);

  if (thumbnail) return null;

  return (
    <form className='w-full max-w-md mx-auto p-2 flex flex-col items-center text-sm'>
      <div className='flex items-center w-full gap-2'>
        <select
          value={formData.span}
          onChange={handleSelectChange}
          className='flex-1 bg-white border border-gray-300 py-1.5 px-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm text-xs transition'
        >
          <option value='x'>All</option>
          <option value='1'>1 Day</option>
          <option value='3'>3 Days</option>
          <option value='7'>1 Week</option>
          <option value='30'>1 Month</option>
          <option value='182'>6 Months</option>
          <option value='365'>1 Year</option>
          <option value='1095'>3 Years</option>
        </select>

        <button
          type='button'
          onClick={toggleAdv}
          className='px-3 py-1.5 rounded-md shadow-sm sm:text-sm text-xs font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition'
        >
          {advanced ? 'Hide' : 'Configure'}
        </button>
      </div>

      {advanced && (
        <fieldset className='w-full p-3 border border-gray-300 rounded-lg space-y-2 mt-2'>
          <legend className='font-medium text-gray-700'>Accounts</legend>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'>
            {accounts.map(acc => (
              <label
                key={acc.account_id}
                className='flex items-center gap-2 text-gray-700'
              >
                <input
                  type='checkbox'
                  name={acc.account_id}
                  checked={formData.accounts.includes(acc.account_id)}
                  onChange={handleAccountToggle}
                  className='h-4 w-4 text-green-600 rounded focus:ring-green-500'
                />
                <span>{acc.account_name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </form>
  );
};

export default PieFilter;