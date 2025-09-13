import { useState } from 'react';

const AssetForm = ({ onChange }) => {
  const [form, setForm] = useState({
    estimated_value: '',
    quantity: 1,
    amount: '',
    asset_name: '',
    acquisition_date: '',
    iso_currency_code: 'USD',
    bio: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (onChange) onChange({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <>
      <input type='number' step='0.01' name='estimated_value' placeholder='Estimated Value' value={form.estimated_value} onChange={handleChange} className='border p-2 rounded'/>
      <input type='number' name='quantity' placeholder='Quantity' value={form.quantity} onChange={handleChange} className='border p-2 rounded'/>
      <input type='number' step='0.01' name='amount' placeholder='Amount Paid' value={form.amount} onChange={handleChange} className='border p-2 rounded'/>
      <input name='asset_name' placeholder='Asset Name' value={form.asset_name} onChange={handleChange} className='border p-2 rounded'/>
      <input type='date' name='acquisition_date' value={form.acquisition_date} onChange={handleChange} className='border p-2 rounded'/>
      <input name='iso_currency_code' placeholder='Currency' value={form.iso_currency_code} onChange={handleChange} className='border p-2 rounded'/>
      <textarea name='bio' placeholder='Notes' value={form.bio} onChange={handleChange} className='border p-2 rounded'/>
    </>
  );
};

export default AssetForm;