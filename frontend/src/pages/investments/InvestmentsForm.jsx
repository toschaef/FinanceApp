import { useState } from 'react';

const InvestmentForm = ({ onChange }) => {
  const [form, setForm] = useState({
    item_id: '',
    account_id: '',
    security_id: '',
    quantity: '',
    institution_price: '',
    institution_value: '',
    iso_currency_code: 'USD',
    investment_name: '',
    ticker_symbol: '',
    institution_name: '',
    account_name: '',
    mask: '',

    investment_transaction_id: '',
    type: '',
    subtype: '',
    transaction_date: '',
    amount: '',
    price: '',
    txn_quantity: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (onChange) onChange({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <>
      <input name='item_id' placeholder='Item ID' value={form.item_id} onChange={handleChange} className='border p-2 rounded'/>
      <input name='account_id' placeholder='Account ID' value={form.account_id} onChange={handleChange} className='border p-2 rounded'/>
      <input name='security_id' placeholder='Security ID' value={form.security_id} onChange={handleChange} className='border p-2 rounded'/>
      <input type='number' step='0.0001' name='quantity' placeholder='Quantity' value={form.quantity} onChange={handleChange} className='border p-2 rounded'/>
      <input type='number' step='0.0001' name='institution_price' placeholder='Institution Price' value={form.institution_price} onChange={handleChange} className='border p-2 rounded'/>
      <input type='number' step='0.01' name='institution_value' placeholder='Institution Value' value={form.institution_value} onChange={handleChange} className='border p-2 rounded'/>
      <input name='iso_currency_code' placeholder='Currency' value={form.iso_currency_code} onChange={handleChange} className='border p-2 rounded'/>
      <input name='investment_name' placeholder='Investment Name' value={form.investment_name} onChange={handleChange} className='border p-2 rounded'/>
      <input name='ticker_symbol' placeholder='Ticker' value={form.ticker_symbol} onChange={handleChange} className='border p-2 rounded'/>
      <input name='institution_name' placeholder='Institution' value={form.institution_name} onChange={handleChange} className='border p-2 rounded'/>
      <input name='account_name' placeholder='Account Name' value={form.account_name} onChange={handleChange} className='border p-2 rounded'/>
      <input name='mask' placeholder='Mask (last 4)' maxLength={4} value={form.mask} onChange={handleChange} className='border p-2 rounded'/>
      
      <input name='investment_transaction_id' placeholder='Transaction ID' value={form.investment_transaction_id} onChange={handleChange} className='border p-2 rounded'/>
      <input name='type' placeholder='Transaction Type' value={form.type} onChange={handleChange} className='border p-2 rounded'/>
      <input name='subtype' placeholder='Subtype' value={form.subtype} onChange={handleChange} className='border p-2 rounded'/>
      <input type='date' name='transaction_date' value={form.transaction_date} onChange={handleChange} className='border p-2 rounded'/>
      <input type='number' step='0.01' name='amount' placeholder='Amount' value={form.amount} onChange={handleChange} className='border p-2 rounded'/>
      <input type='number' step='0.0001' name='price' placeholder='Price' value={form.price} onChange={handleChange} className='border p-2 rounded'/>
      <input type='number' step='0.0001' name='txn_quantity' placeholder='Transaction Quantity' value={form.txn_quantity} onChange={handleChange} className='border p-2 rounded'/>
    </>
  );
};

export default InvestmentForm;