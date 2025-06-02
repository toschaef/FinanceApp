import React, { createContext, useReducer } from "react";
import axios from "axios";

const initialState = {
  email: null,
  emailVerified: false,
  loggedIn: false,
  hasItem: false,
  state_transactions: null,
  state_investments: null,
  state_accounts: null,
  bankNames: [],
  graphData: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_STATE":
      return { ...state, ...action.state };
    case "WIPE_STATE":
        return { ...initialState };
    case "REM_BANK":
      const filtered = bankNames.filter((e) => { e !== action.bankName }); 
      return {
        ...state,
        bankNames: filtered,
      }
    default:
      return state;
  }
};

const Context = createContext();

const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshContext = async (emailInput) => {
    try {
      const res = await axios.get(`/api/all`, {
        params: { email: emailInput },
      });
      dispatch({
        type: "SET_STATE",
        state: {
          state_transactions: res.data.transactions,
          state_investments: res.data.investments,
          state_accounts: res.data.accounts,
        },
      });
    } catch (err) {
      console.error('Error refreshing context', err);
    }
  };

  return (
    <Context.Provider value={{ ...state, dispatch, refreshContext }}>
      {children}
    </Context.Provider>
  );
};

export { Provider };
export default Context;
