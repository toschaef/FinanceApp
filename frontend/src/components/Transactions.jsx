import { useEffect, useState, useContext } from 'react';
import Context from '../Context';
import formatCurrency from '../util/formatCurrency';

const Transactions = () => {
  const { state_transactions, state_accounts } = useContext(Context);
  const [transactions, setTransactions] = useState({});

  const accountNameFromId = (id) => {
    const account = state_accounts.find(a => a.account_id === id);
    return account ? account.account_name : 'Unknown Account';
  };

  const groupByBankAndAccount = (transactions) => {
    const mappedTransactions = transactions.map((t) => ({
      bank_name: t.institution_name,
      account_id: t.account_id,
      account_name: t.account_name,
      name: t.transaction_name,
      amount: t.amount,
      iso_currency_code: t.iso_currency_code,
      date: t.transaction_date.split('T')[0],
      category: t.finance_category,
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
  }, [state_transactions]);

  return (
    <div className="bg-gray-100">
      <div className='m-4 p-2 rounded-lg bg-white'>
      <div className="font-sans rounded-xl shadow-md">
        {state_transactions.length === 0 ? (
          <p className="p-4">No transactions found.</p>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-2 py-2 px-4 text-md text-gray-700 font-bold bg-gray-300 border-b">
              <span>Account</span>
              <span>Transaction</span>
              <span>Category</span>
              <span>Date</span>
              <span className="text-right">Amount</span>
            </div>

            <div>
              {state_transactions.map((txn) => (
                <div
                  key={`${txn.account_id}-${txn.transaction_name}-${txn.transaction_date}`}
                  className="grid grid-cols-5 gap-2 px-4 py-2 text-sm text-gray-600 border-b"
                >
                  <span>{accountNameFromId(txn.account_id)}</span>
                  <span>{txn.transaction_name}</span>
                  <span>{txn.finance_category}</span>
                  <span>{txn.transaction_date.split('T')[0]}</span>
                  <span className="text-right">{formatCurrency(txn.amount, txn.iso_currency_code)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
};

export default Transactions;
