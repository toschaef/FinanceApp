import React, { createContext, useReducer } from "react";

const initialState = {
  linkToken: null,
  linkTokenError: null,
  isPaymentInitiation: false,
  isCraProductsExclusively: false,
  isUserTokenFlow: false,
  products: [],
  backend: true,
  userToken: null,
  email: null,
  loggedIn: false,
  hasItem: false,
  state_transactions: null,
  state_investments: null,
  state_accounts: null,
  bankNames: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_STATE":
      return { ...state, ...action.state };
    case "WIPE_STATE":
        return { ...initialState };
    case "ADD_BANK":
      return {
        ...state,
        bankNames: [...state.bankNames, action.bankName],
      };
    default:
      return state;
  }
};

const Context = createContext();

const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <Context.Provider value={{ ...state, dispatch }}>
      {children}
    </Context.Provider>
  );
};

export { Provider };
export default Context;
