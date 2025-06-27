import { useState, useContext, useEffect, useMemo } from "react";
import { subDays, eachDayOfInterval, eachHourOfInterval, eachMinuteOfInterval, formatISO } from "date-fns";
import Context from "../Context";

const ToggleGraph = () => {
  const { state_accounts, state_transactions, state_investments, state_assets, dispatch, hasItem } = useContext(Context);
  const [advanced, setAdvanced] = useState(false);
  const [formData, setFormData] = useState({ 
    span: "30", 
    includeInv: true, 
    accounts: new Set(state_accounts.map(a => a.account_id)), 
    assets: hasItem? new Set() : new Set(state_assets.map(a => a.id)) }); // if asset but no item, start with assets checked

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

  const handleAssetToggle = e => {
    const id = Number(e.target.name);
    setFormData(d => {
      const next = new Set(d.assets);
      e.target.checked ? next.add(id) : next.delete(id);
      return { ...d, assets: next };
    });
  }

  const graphData = useMemo(() => {
    const { span, includeInv, accounts, assets } = formData;
    const keepAccount = (id) => accounts.size === 0 || accounts.has(id);
    const keepAsset = (id) => assets.has(id);

    // collect each relevant date
    const tDates = state_transactions.map(
      t => +new Date(t.transaction_date)
    );
    const iDates = state_investments.flatMap(inv =>
      inv.transactions.map(txn => +new Date(txn.transaction_date))
    );
    const aDates = state_assets.map(
      a => +new Date(a.acquisition_date)
    );

    // get date window
    const spanNum = span === 'x'? null : Number(span);
    const end = new Date();
    const start =
      span === 'x' // if all time, pick oldest transaction/inv transaction date
        ? new Date(Math.min(...tDates, ...iDates, ...aDates))
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


    state_transactions.forEach(t => {
      if (!keepAccount(t.account_id)) return;
      const key = dateKey(new Date(t.transaction_date));
      console.log('added transaction');
      dates[key] && (dates[key].change += Number(t.amount));
    });

    if (includeInv) {
      state_investments.forEach(i => {
        i.transactions.forEach(it => {
          if (!keepAccount(it.account_id)) return;
          const key = dateKey(new Date(it.transaction_date));
          dates[key] && (dates[key].change += Number(it.amount));
        })
      });
    }

    // sort dates asc
    const sorted = Object.values(dates).sort(
      (a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf()
    );

    let offsetBeforeWindow = 0;
    state_assets.forEach(a => {
      if (!keepAsset(a.id)) return;
    
      const acquired = a.acquisition_date && new Date(a.acquisition_date);
      
      if (!acquired || acquired < start) {
        // offset out of scope assets
        offsetBeforeWindow += Number(a.amount);
      } else if (acquired && acquired >= start && acquired <= end) {
        // add to day
        const key = dateKey(acquired);
        dates[key].change += Number(a.amount);
      }
    });

    let running = offsetBeforeWindow;
    sorted.forEach(p => {
      running += p.change;
      p.balance = running;
    });

    const actual = state_accounts
      .filter(ac => keepAccount(ac.account_id))
      .reduce((sum, ac) => sum + Number(ac.account_balance), 0)
      + state_assets
        .filter(a => keepAsset(a.id))
        .reduce((sum, a) => sum + Number(a.amount), 0);

    const delta = actual - running;
    sorted.forEach(p => {
      p.balance += delta;
    });
    
    return sorted;
  }, [formData, state_transactions, state_investments, state_accounts, state_assets]);

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
          {state_assets.map(ast => (
            <label key={ast.id}>
              <input
                type="checkbox"
                name={ast.id}
                checked={formData.assets.has(ast.id)}
                onChange={handleAssetToggle}
              />
              <span>{ast.asset_name}</span>
            </label>
          ))}
        </fieldset>
      )}
    </form>
  );
};

export default ToggleGraph;
