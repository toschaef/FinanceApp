import React, { useContext, useState } from 'react';
import Context from '../Context';
import axios from 'axios';

const AssetButton = ({ text }) => {
  const { email, refreshProduct } = useContext(Context);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    email,
    asset_name: '',
    estimated_value: '',
    quantity: '',
    acquisition_date: '',
    iso_currency_code: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/assets', { email, ...formData });
      console.log('asset form submitted', formData);
      setFormData({
        asset_name: '',
        estimated_value: '',
        quantity: '',
        acquisition_date: '',
        iso_currency_code: '',
        description: ''
      });
      refreshProduct('assets', email);
    } catch (err) {
      console.error('Error submitting new asset', err);
    } finally {
      setShow(false);
    }
  };

  return (<>
    <button onClick={() => setShow(prev => !prev)}>{text}</button>
    {show &&
      <fieldset>
        <input
          name="asset_name"
          placeholder="Asset Name"
          value={formData.asset_name}
          onChange={handleChange}
          required
        />
        <input
          name="estimated_value"
          placeholder="Estimated Value"
          value={formData.estimated_value}
          onChange={handleChange}
          type="number"
          required
        />
        <input
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          type="number"
          required
        />
        <input
          name="acquisition_date"
          placeholder="Acquisition Date"
          value={formData.acquisition_date}
          onChange={handleChange}
          type="date"
        />
        <input
          name="iso_currency_code"
          placeholder="Currency Code (USD)"
          value={formData.iso_currency_code}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <button onClick={handleSubmit}>Add</button>
      </fieldset>
    }
  </>);
};

export default AssetButton;