import { useEffect, useState, useContext } from "react";
import Context from '../Context';
import formatCurrency from '../util/formatCurrency';
import axios from 'axios';

const Accounts = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const { email, state_accounts, dispatch } = useContext(Context);

  const fetchAccounts = async () => {
    const res = await axios.get(`/api/accounts?email=${email}`);

    console.log("Account data", res.data);
    
    return res.data.accounts.map((a) => ({
      institution_name: a.institution_name || "institution name not found",
      account_name: a.account_name || "account name not found",
      balance: a.account_balance,
      iso_currency_code: a.iso_currency_code || 'USD',
    }));
  };

  const groupByBank = (accounts) => {
    const grouped = {};
    for (const a of accounts) {
      const instKey = a.institution_name;
  
      if (!grouped[instKey]) grouped[instKey] = [];
      grouped[instKey].push(a);
    }
    return grouped;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const accountData = await fetchAccounts();
        const grouped = groupByBank(accountData);
        dispatch({
          type: "SET_STATE",
          state: { state_accounts: grouped },
        });
        setAccounts(grouped);
      } catch (err) {
        console.error(err);
        setError('Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };
    if (state_accounts) {
      setAccounts(state_accounts);
    } else {
      load();
    }
  }, []);

  return (
    <div>
      <h1>Accounts</h1>
      {loading ? (
        <p>Loading accounts...</p>
      ) : error ? (
        <p>{error}</p>
      ) : Object.keys(accounts).length === 0 ? (
        <p>No accounts found.</p>
      ) : (
        <>
          {Object.entries(accounts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([instName, accs]) => (
              <div key={instName}>
                <h2>{instName}</h2>
                <ul>
                  {accs.map((acc, index) => (
                    <li key={index}>
                      {acc.account_name} - {formatCurrency(Math.abs(acc.balance), acc.currency)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </>
      )}
    </div>
  );
};

export default Accounts;
