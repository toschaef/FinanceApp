import { useEffect, useState, useContext } from 'react';
import Context from '../Context';
import formatCurrency from '../util/formatCurrency';

const Investments = () => {
  const { state_investments } = useContext(Context);
  const [holdings, setHoldings] = useState({});

  const groupByBankAndAccount = (holdings) => {
    const mappedHoldings = holdings.map((h) => ({
      bank_name: h.institution_name,
      account_id: h.account_id,
      account_name: h.account_name,
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
    setHoldings(groupByBankAndAccount(state_investments));
  }, []);

  return (
    <div>
      <h1>Investments</h1>
        {Object.keys(holdings).length === 0 ? (
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
                  .map(([accountName, itxns]) => (
                    <div key={accountName}>
                      <h3>{accountName}</h3>
                      <ul>
                        {itxns.map((h, idx) => (
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
