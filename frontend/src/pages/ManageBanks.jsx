import React, { useState, useContext } from 'react';
import Context from '../Context';
import LinkButton from '../components/LinkButton'
import NavBar from '../components/NavBar';
import axios from 'axios';

const ManageBanks = () => {
  const { email, bankNames, dispatch } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (bankName) => {
    setLoading(true);
    console.log(`Deleting Item with name : ${bankName}`);
    try {
      await axios.delete(`http://localhost:5000/api/delete-item?bankName=${bankName}&email=${email}`);

      const newBankNames = bankNames.filter((e) => e !== bankName);

      dispatch({
        type: 'SET_STATE',
        state: {
          bankNames: newBankNames,
          hasItem: !!newBankNames.length,
        }
      });
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
      <h1>Manage Your Banks</h1>
      {loading && <p>loading...</p>}
      {error && <p>{error}</p>}
      <ul>
        {bankNames.length > 0 ? (
          bankNames.map((name) => (
            <li key={name}>
              <h1>{name}</h1>
              <button onClick={() => handleDelete(name)}>Remove Bank</button>
            </li>
          ))
        ) : (
          <p>No banks linked yet.</p>
        )}
      </ul>
      <LinkButton text={"Add Bank"} />
    </div>
  );
};

export default ManageBanks;
