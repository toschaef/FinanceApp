import { useEffect, useState, useContext } from 'react';
import Context from '../Context';
import formatCurrency from '../util/formatCurrency';
import NavBar from './NavBar';

const Accounts = () => {
  const { state_accounts } = useContext(Context);
  const [accounts, setAccounts] = useState('');

  const groupByBank = (accounts) => {
    const mappedAccounts = accounts.map((a) => ({
      institution_name: a.institution_name,
      account_name: a.account_name,
      balance: a.account_balance,
      iso_currency_code: a.iso_currency_code,
    }));

    const grouped = {};
    for (const a of mappedAccounts) {
      const instKey = a.institution_name;
  
      if (!grouped[instKey]) grouped[instKey] = [];
      grouped[instKey].push(a);
    }
    return grouped;
  };

  useEffect(() => {
    setAccounts(groupByBank(state_accounts));
  }, []);

  return (
    <div>
      <NavBar />
      <h1>Accounts</h1>
      {Object.keys(accounts).length === 0 ? (
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
