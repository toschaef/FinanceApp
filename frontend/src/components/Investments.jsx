import { useEffect, useState, useContext } from "react";
import Context from '../Context';
import formatCurrency from '../util/formatCurrency';
import axios from 'axios';

const Investments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const { email, state_investments, dispatch } = useContext(Context);

  const fetchHoldings = async () => {
    const res = await axios.get(`/api/investments?email=${email}`);

    console.log("Investment data", res.data);

    return res.data.investments;
  };  
  const groupByBankAndAccount = (holdings) => {
    const mappedHoldings = holdings.map((h) => ({
      bank_name: h.institution_name || "institution name not found",
      account_id: h.account_id,
      account_name: h.account_name || "account name not found",
      name: h.investment_name,
      institution_value: h.institution_value,
      iso_currency_code: h.iso_currency_code,
    }));

    const grouped = {};
    for (const i of mappedHoldings) {
      const instKey = i.bank_name;
      const accountKey = i.account_name;
  
      if (!grouped[instKey]) grouped[instKey] = {};
      if (!grouped[instKey][accountKey]) grouped[instKey][accountKey] = [];
      grouped[instKey][accountKey].push(i);
    }
    return grouped;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const holdingsData = await fetchHoldings();
        dispatch({
          type: "SET_STATE",
          state: { state_investments: holdingsData },
        });
        const grouped = groupByBankAndAccount(holdingsData);
        setHoldings(grouped);
      } catch (err) {
        console.error(err);
        setError("Failed to load investments");
      } finally {
        setLoading(false);
      }
    }; 
    if (state_investments) {
      setHoldings(groupByBankAndAccount(state_investments));
    } else {
      load();
    }
  }, []);

  return (
    <div>
      <h1>Investments</h1>
        {loading ? (
          <p>Loading investments...</p>
        ) : error ? (
          <p>{error}</p>
        ) : Object.keys(holdings).length === 0 ? (
          <p>No investments found.</p>
        ) : (
          <>
          {Object.entries(holdings)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([bankName, accounts]) => (
              <div key={bankName}>
                <h2>{bankName}</h2>
                {Object.entries(accounts)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([accountName, holdings]) => (
                    <div key={accountName}>
                      <h3>{accountName}</h3>
                      <ul>
                        {holdings.map((h, idx) => (
                          <li key={idx}>
                          {h.name} - 
                          <span>
                            {formatCurrency(Math.abs(h.institution_value), h.iso_currency_code)}
                          </span>
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

export default Investments;
