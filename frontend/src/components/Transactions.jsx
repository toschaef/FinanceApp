import { useEffect, useState, useContext } from "react";
import Context from '../Context';
import formatCurrency from '../util/formatCurrency';
import axios from 'axios';

const Transactions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const { email, state_transactions, dispatch } = useContext(Context);

  const fetchTransactions = async () => {
    const res = await axios.get(`/api/transactions?email=${email}`);

    console.log("Transaction data", res.data);
    
    return res.data.transactions;
  };

  const groupByBankAndAccount = (transactions) => {
    const mappedTransactions = transactions.map((t) => ({
      bank_name: t.institution_name || "institution name not found",
      account_id: t.account_id,
      account_name: t.account_name || "account name not found",
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
    const load = async () => {
      setLoading(true);
      try {
        const transactionData = await fetchTransactions();
        dispatch({
          type: "SET_STATE",
          state: { state_transactions: transactionData },
        });
        const grouped = groupByBankAndAccount(transactionData);
        setTransactions(grouped);
      } catch (err) {
        console.error(err);
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    if (state_transactions) {
      setTransactions(groupByBankAndAccount(state_transactions));
    } else {
      load();
    }
  }, []);

  return (
    <div>
      <h1>Transactions</h1>
        {loading ? (
          <p>Loading transactions...</p>
        ) : error ? (
          <p>{error}</p>
        ) : Object.keys(transactions).length === 0 ? (
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
