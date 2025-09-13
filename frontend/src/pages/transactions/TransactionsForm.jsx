import { useState, useEffect } from 'react';

const TransactionsForm = ({ onChange }) => {
  const [showLocation, setShowLocation] = useState(false);
    const [form, setForm] = useState({
      transaction_name: null,
      amount: null,
      transaction_date: null,
      finance_category: null,
      account_name: null,
      institution_name: null,
      mask: null,
      lat: null,
      lng: null,
      address: null,
    });

  const categories = [
    'Income', 'Transfer', 'Loan Payment', 
    'Bank Fee', 'Entertainment', 'Food and Drink', 'Shopping', 
    'Home Improvement', 'Medical', 'Personal Care', 'Rent',
    'Service', 'Non-Profit', 'Transportation', 'Travel',
  ];

  useEffect(() => {
    if (onChange) onChange(form);
  }, [form]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className='flex flex-col gap-6 max-h-[80vh] overflow-y-auto w-full'>
      {/* basic data */}
      <section className='flex flex-col gap-3'>
        <h3 className='text-lg font-semibold border-b pb-1'>Basic Info</h3>
        <div className='grid gap-3 sm:grid-cols-2'>
          <div>
            <label htmlFor='transaction_name' className='block text-sm font-medium text-gray-700'>
              Transaction Name
            </label>
            <input
              id='transaction_name'
              name='transaction_name'
              value={form.transaction_name}
              onChange={handleInputChange}
              required
              placeholder='Starbucks'
              className='w-full rounded-md border px-3 py-2 placeholder:italic placeholder:text-slate-400'
            />
          </div>
          <div>
            <label htmlFor='amount' className='block text-sm font-medium text-gray-700'>
              Amount
            </label>
            <input
              id='amount'
              name='amount'
              value={form.amount}
              onChange={handleInputChange}
              type='number'
              step='0.01'
              required
              placeholder='0.00'
              className='w-full rounded-md border px-3 py-2 placeholder:italic placeholder:text-slate-400'
            />
          </div>
          <div>
            <label htmlFor='transaction_date' className='block text-sm font-medium text-gray-700'>
              Date
            </label>
            <input
              id='transaction_date'
              name='transaction_date'
              value={form.transaction_date}
              onChange={handleInputChange}
              type='date'
              required
              className='w-full rounded-md border px-3 py-2 text-gray-700 invalid:text-slate-400'
            />
          </div>
          <div>
            <label htmlFor='finance_category' className='block text-sm font-medium text-gray-700'>
              Category
            </label>
            <select
              id='finance_category'
              name='finance_category'
              value={form.finance_category}
              onChange={handleInputChange}
              required
              className='w-full rounded-md border bg-white px-3 py-2 text-gray-900 invalid:text-slate-400'
            >
              <option value=''>Select category</option>
              {categories.map((label) => (
                <option key={label} value={label} className='text-gray-900'>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* account data */}
      <section className='flex flex-col gap-3'>
        <h3 className='text-lg font-semibold border-b pb-1'>Account Info</h3>
        <div className='grid gap-3 sm:grid-cols-3'>
          <div>
            <label htmlFor='account_name' className='block text-sm font-medium text-gray-700'>
              Account Name
            </label>
            <input
              id='account_name'
              name='account_name'
              value={form.account_name}
              onChange={handleInputChange}
              placeholder='Premier Checking'
              className='w-full rounded-md border px-3 py-2 text-xs placeholder:italic placeholder:text-slate-400'
            />
          </div>
          <div>
            <label htmlFor='institution_name' className='block text-sm font-medium text-gray-700'>
              Bank Name
            </label>
            <input
              id='institution_name'
              name='institution_name'
              value={form.institution_name}
              onChange={handleInputChange}
              placeholder='Bank of America'
              className='w-full rounded-md border px-3 py-2 text-xs placeholder:italic placeholder:text-slate-400'
            />
          </div>
          <div>
            <label htmlFor='mask' className='block text-sm font-medium text-gray-700'>
              Last 4 Digits of Acc #
            </label>
            <input
              id='mask'
              name='mask'
              value={form.mask}
              onChange={handleInputChange}
              type='text'
              pattern='[0-9]{4}'
              maxLength='4'
              placeholder='1234'
              className='w-full rounded-md border px-3 py-2 placeholder:italic text-xs placeholder:text-slate-400'
            />
          </div>
        </div>
      </section>

      {/* location data */}
      <section className='flex flex-col gap-3'>
        <div className='flex items-center justify-between border-b pb-1'>
          <h3 className='text-lg font-semibold'>Location</h3>
          <button
            type='button'
            onClick={() => setShowLocation(!showLocation)}
            className='text-sm font-medium text-blue-600 hover:underline focus:outline-none'
          >
            {showLocation ? 'Hide' : 'Add'}
          </button>
        </div>
        {showLocation && (
          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='sm:col-span-2'>
              <label htmlFor='address' className='block text-sm font-medium text-gray-700'>
                Address (optional)
              </label>
              <input
                id='address'
                name='address'
                value={form.address}
                onChange={handleInputChange}
                placeholder='123 P St, Lincoln, NE'
                className='w-full rounded-md border px-3 py-2 text-xs placeholder:italic placeholder:text-slate-400'
              />
            </div>
            <div>
              <label htmlFor='lat' className='block text-sm font-medium text-gray-700'>
                Latitude (optional)
              </label>
              <input
                id='lat'
                name='lat'
                value={form.lat}
                onChange={handleInputChange}
                type='number'
                step='any'
                placeholder='40.8136'
                className='w-full rounded-md border px-3 py-2 text-xs placeholder:italic placeholder:text-slate-400'
              />
            </div>
            <div>
              <label htmlFor='lng' className='block text-sm font-medium text-gray-700'>
                Longitude (optional)
              </label>
              <input
                id='lng'
                name='lng'
                value={form.lng}
                onChange={handleInputChange}
                type='number'
                step='any'
                placeholder='-96.7026'
                className='w-full rounded-md border px-3 py-2 text-xs placeholder:italic placeholder:text-slate-400'
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TransactionsForm;