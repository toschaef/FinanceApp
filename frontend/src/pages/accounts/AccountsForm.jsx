import { useState } from 'react';

const AccountForm = ({ onChange }) => {
  const [form, setForm] = useState({
    item_id: '',
    account_id: '',
    account_balance: '',
    iso_currency_code: 'USD',
    account_name: '',
    account_type: '',
    account_subtype: '',
    institution_name: '',
    mask: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (onChange) onChange({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <>
      <input name='item_id' placeholder='Item ID' value={form.item_id} onChange={handleChange} className='border p-2 rounded'/>
      <input name='account_id' placeholder='Account ID' value={form.account_id} onChange={handleChange} className='border p-2 rounded'/>
      <input type='number' step='0.01' name='account_balance' placeholder='Balance' value={form.account_balance} onChange={handleChange} className='border p-2 rounded'/>
      <input name='iso_currency_code' placeholder='Currency' value={form.iso_currency_code} onChange={handleChange} className='border p-2 rounded'/>
      <input name='account_name' placeholder='Account Name' value={form.account_name} onChange={handleChange} className='border p-2 rounded'/>
      <input name='account_type' placeholder='Account Type' value={form.account_type} onChange={handleChange} className='border p-2 rounded'/>
      <input name='account_subtype' placeholder='Account Subtype' value={form.account_subtype} onChange={handleChange} className='border p-2 rounded'/>
      <input name='institution_name' placeholder='Institution' value={form.institution_name} onChange={handleChange} className='border p-2 rounded'/>
      <input name='mask' placeholder='Mask (last 4)' maxLength={4} value={form.mask} onChange={handleChange} className='border p-2 rounded'/>
    </>
  );
};

export default AccountForm;