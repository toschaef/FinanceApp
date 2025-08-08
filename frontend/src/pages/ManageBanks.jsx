import { useState, useContext } from 'react';
import Context from '../Context';
import LinkButton from '../components/LinkButton';
import NavBar from '../components/NavBar';
import axios from 'axios';

const ManageBanks = () => {
  const { email, bankNames, hasItem, state_accounts, user_token, dispatch, refreshContext } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // return balance from bank name
  const getBalance = (name) => (
    state_accounts.reduce((amount, acc) => {
      // get total balace for each link
      if (acc.institution_name === name) {
        return amount + Number(acc.account_balance);
      }
      return amount;
    }, 0).toLocaleString('en-US', {
      style: 'currency',
      // format with first found shared account's iso
      currency: state_accounts.find(acc => acc.institution_name === name).iso_currency_code || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );

  const handleDelete = async (bankName) => {
    setLoading(true);
    setError('');
    console.log(`Deleting Item with name : ${bankName}`);
    try {
      await axios.delete('/api/delete-item', {
        params: {
          bankName,
          email,
          user_token,
      }});

      const newBankNames = bankNames.filter((e) => e !== bankName);

      dispatch({
        type: 'SET_STATE',
        state: {
          bankNames: newBankNames,
          hasItem: !!newBankNames.length,
        }
      });
      refreshContext(email, user_token);
    } catch (err) {
      console.log('Error deleting item', err);
      setError('Error deleting item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar />

      <div className="flex justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {hasItem ? 'Linked Banks' : 'Link bank via Plaid'}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-exclamation-circle mr-2 flex-shrink-0"
                viewBox="0 0 16 16"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="text-gray-700 text-center mb-4">Loading...</div>
          )}

          {hasItem && (
            <ul className="space-y-4">
              {bankNames.map((name) => (
                <li
                  key={name}
                  className="relative bg-gray-50 p-4 rounded-md shadow-sm"
                >
                  <button
                    onClick={() => handleDelete(name)}
                    className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-500 text-red-600 hover:text-white transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                    </svg>
                  </button>

                  <div className="flex justify-between items-center pr-10">
                    <span className="text-lg font-semibold text-gray-800">
                      {name}
                    </span>
                    <span className="text-lg font-medium text-gray-700 text-right">
                      {getBalance(name)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex justify-center">
            <LinkButton text="Add Bank" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBanks;
