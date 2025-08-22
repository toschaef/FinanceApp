import { createContext, useReducer } from 'react';
import axios from 'axios';

const initialState = {
  bankNames: [],
  email: null,
  emailVerified: false,
  fullSideBar: false,
  graphData: [],
  hasItem: false,
  loggedIn: false,
  state_accounts: [],
  state_assets: [],
  state_investments: [],
  state_transactions: [],
  user_token: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.state };
    case 'WIPE_STATE':
        return { ...initialState };
    case 'REM_BANK':
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

  const refreshContext = async (email, user_token) => {
    try {
      const res = await axios.get(`/api/all`, {
        params: { email, user_token },
      });
      dispatch({
        type: 'SET_STATE',
        state: {
          state_transactions: res.data.transactions,
          state_investments: res.data.investments,
          state_accounts: res.data.accounts,
          state_assets: res.data.assets,
        },
      });
    } catch (err) {
      console.error('Error refreshing context', err);
    }
  };

  const refreshProduct = async (prod, email, token) => {
    try {
      const key = `state_${prod}`;
      console.log('user token:', token);
      const res = await axios.get(`/api/${prod}?email=${email}&user_token=${token}`);
      dispatch({
        type: 'SET_STATE',
        state: { [key]: res.data[prod] }
      });
      return res.data[prod]
    } catch (err) {
      console.error('Error refreshing product', err);
    }
  }

  return (
    <Context.Provider value={{ ...state, dispatch, refreshContext, refreshProduct }}>
      {children}
    </Context.Provider>
  );
};

export { Provider };
export default Context;
