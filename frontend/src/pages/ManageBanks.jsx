import React, { useState, useContext } from 'react';
import Context from '../Context';
import LinkButton from '../components/LinkButton'
import NavBar from '../components/NavBar';
import axios from 'axios';

const ManageBanks = () => {
  const { email, bankNames, hasItem, dispatch, refreshContext } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (bankName) => {
    setLoading(true);
    console.log(`Deleting Item with name : ${bankName}`);
    try {
      await axios.delete('/api/delete-item', {
        bankName,
        email
      });

      const newBankNames = bankNames.filter((e) => e !== bankName);

      dispatch({
        type: 'SET_STATE',
        state: {
          bankNames: newBankNames,
          hasItem: !!newBankNames.length,
        }
      });
      refreshContext(email);
    } catch (err) {
      console.log('Error deleting item', err);
      setError('Error deleting item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar />
      {hasItem? <h1>Linked Banks</h1> : <h1>Link bank via plaid</h1>}
      {loading && <p>loading...</p>}
      {error && <p>{error}</p>}
      <ul>
        {hasItem &&
          bankNames.map((name) => (
            <li key={name}>
              <h1>{name}</h1>
              <button onClick={() => handleDelete(name)}>Remove Bank</button>
            </li>
          ))}
      </ul>
      <br />
      <LinkButton text={"Add Bank"} />
    </div>
  );
};

export default ManageBanks;
