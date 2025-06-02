import { useState, useContext, useEffect, useMemo } from "react";
import { subDays, eachDayOfInterval, eachHourOfInterval, eachMinuteOfInterval, formatISO } from "date-fns";
import Context from "../Context";

const ToggleGraph = () => {
  const { state_accounts, state_transactions, state_investments, dispatch, } = useContext(Context);
  const [advanced, setAdvanced] = useState(false);
  const [formData, setFormData] = useState({ span: "30", includeTxns: true, includeInv: true, accounts: new Set(state_accounts.map(a => a.account_id)) });

  const toggleAdv = () => {
    setAdvanced(a => !a);
  }

  const handleSelectChange = (e) => {
    setFormData(d => ({ ...d, span: e.target.value }));
  }
    
  const handleProductToggle = (e) => {
    setFormData(d => ({ ...d, [e.target.name]: e.target.checked }));
  }

  const handleAccountToggle = e => {
    setFormData(d => {
      const next = new Set(d.accounts);
      e.target.checked ? next.add(e.target.name) : next.delete(e.target.name);
      return { ...d, accounts: next };
    });
  }

  const graphData = useMemo(() => {
    const { span, includeTxns, includeInv, accounts } = formData;
    const keep = (id) => accounts.size === 0 || accounts.has(id);
    
    const tDates = state_transactions.map(
      t => +new Date(t.transaction_date)
    );
    const iDates = state_investments.flatMap(inv =>
      inv.transactions.map(txn => +new Date(txn.transaction_date))
    );

    // get date window
    const spanNum = span === 'x'? null : Number(span);
    const end = new Date();
    const start =
      span === 'x' // if all time, pick oldest transaction/inv transaction date
        ? new Date(Math.min(...tDates, ...iDates))
        : subDays(end, Number(span));

    let intervalFunc, dateKey, step;

    if (spanNum !== null && spanNum <= 1) { // 1 day
      intervalFunc = eachMinuteOfInterval;
      dateKey = (d) => formatISO(d).slice(0, 16);
      step = { minutes: 15 };
    } else if (spanNum !== null && spanNum <= 7) { // < 1 week
      intervalFunc = eachHourOfInterval;
      dateKey = (d) => formatISO(d).slice(0, 13);
      step = { hours: 1 };
    } else { // > 1 week
      intervalFunc = eachDayOfInterval;
      dateKey = (d) => formatISO(d, { representation: "date" });
    }

    // init every date in window
    const dates = {};
    intervalFunc({ start, end }, step).forEach(d => {
      const key = dateKey(d);
      dates[key] = { date: key, change: 0 };
    });

    if (includeTxns) {
      state_transactions.forEach(t => {
        if (!keep(t.account_id)) return;
        const key = dateKey(new Date(t.transaction_date));
        dates[key] && (dates[key].change += Number(t.amount));
      });
    }

    if (includeInv) {
      state_investments.forEach(i => {
        i.transactions.forEach(it => {
          if (!keep(it.account_id)) return;
          const key = dateKey(new Date(it.transaction_date))
          dates[key] && (dates[key].change += Number(it.amount));
        })
      });
    }
    // sort dates asc
    const sorted = Object.values(dates).sort(
      (a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf()
    );

    // get running balance
    let running = 0;
    sorted.forEach(p => {
      running += p.change;
      p.balance = running;
    });

    // get actual balance
    const actual = state_accounts
      .filter(a => keep(a.account_id))
      .reduce((s, a) => s + Number(a.account_balance), 0);

    // offset investments and amounts existing before transaction history
    const offset = actual - running;
    sorted.forEach(p => (p.balance += offset));

    // return dates as array
    return sorted;
  }, [formData, state_transactions, state_investments, state_accounts]);

  useEffect(() => {
    dispatch({ type: "SET_STATE", state: { graphData } });
  }, [graphData, dispatch]);

  return (
    <form>
      <label>
        Filter:
        <select value={formData.span} onChange={handleSelectChange}>
          <option value="x">All Time</option>
          <option value="1">1 Day</option>
          <option value="3">3 Days</option>
          <option value="7">1 Week</option>
          <option value="30">1 Month</option>
          <option value="182">6 Months</option>
          <option value="365">1 Year</option>
          <option value="1095">3 Years</option>
        </select>
      </label>

      <button type="button" onClick={toggleAdv}>
        {advanced ? "Hide" : "Advanced"}
      </button>

      {advanced && (
        <fieldset>
          <legend>Graph filters</legend>
          <label>
            <input
              type="checkbox"
              name="includeTxns"
              checked={formData.includeTxns}
              onChange={handleProductToggle}
            />
            Transactions
          </label>

          <label>
            <input
              type="checkbox"
              name="includeInv"
              checked={formData.includeInv}
              onChange={handleProductToggle}
            />
            Investments
          </label>

          {state_accounts.map(acc => (
            <label key={acc.account_id}>
              <input
                type="checkbox"
                name={acc.account_id}
                checked={formData.accounts.has(acc.account_id)}
                onChange={handleAccountToggle}
              />
              <span>{acc.account_name}</span>
            </label>
          ))}
        </fieldset>
      )}
    </form>
  );
};

export default ToggleGraph;
