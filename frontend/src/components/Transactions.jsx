import { useEffect, useState, useContext } from 'react';
import Context from '../Context';
import formatCurrency from '../util/formatCurrency';
import NavBar from './NavBar';

const Transactions = () => {
  const { state_transactions } = useContext(Context);
  const [transactions, setTransactions] = useState('');

  const groupByBankAndAccount = (transactions) => {
    const mappedTransactions = transactions.map((t) => ({
      bank_name: t.institution_name,
      account_id: t.account_id,
      account_name: t.account_name,
      name: t.transaction_name,
      amount: t.amount,
      iso_currency_code: t.iso_currency_code,
      date: t.transaction_date.split('T')[0],
    }));
    
    const grouped = {};
    for (const t of mappedTransactions) {
      const bankKey = t.bank_name;
      const accountKey = t.account_name;
  
      if (!grouped[bankKey]) grouped[bankKey] = {};
      if (!grouped[bankKey][accountKey]) grouped[bankKey][accountKey] = [];
      grouped[bankKey][accountKey].push(t);
    }
    return grouped;
  };

  useEffect(() => {
    setTransactions(groupByBankAndAccount(state_transactions));
  }, []);

  return (
    <div>
      <NavBar />
      <h1>Transactions</h1>
        {Object.keys(transactions).length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <>
          {Object.entries(transactions)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([bankName, accounts]) => (
              <div key={bankName}>
                <h2>{bankName}</h2>
                {Object.entries(accounts)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([accountName, txns]) => (
                    <div key={accountName}>
                      <h3>{accountName}</h3>
                      <ul>
                        {txns.map((t, idx) => (
                          <li key={idx}>
                          {t.name} - 
                          <span>
                            {formatCurrency(Math.abs(t.amount), t.iso_currency_code)}
                          </span> on {t.date}
                        </li>
                        ))}
                      </ul>
                    </div>
                ))}
              </div>
          ))}
          </>
        )}
    </div>
  );
};

export default Transactions;
