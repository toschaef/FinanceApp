import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Context from '../Context';

const Login = () => {
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { dispatch, refreshProduct } = useContext(Context);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginRes = await axios.post('/api/login', {
        email: emailInput,
        password,
      });

      const user = loginRes.data.user;

      if (user.hasItem) {
        const res = await axios.get(`/api/all`, {
          params: { email: emailInput },
        });
        console.log('response', res.data);
        const data = res.data;

        dispatch({
          type: "SET_STATE",
          state: {
            email: user.email,
            loggedIn: true,
            hasItem: true,
            bankNames: user.bankNames,
            state_transactions: data.transactions,
            state_investments: data.investments,
            state_accounts: data.accounts,
            state_assets: data.assets,
          },
        });
      } else {
        refreshProduct('assets', user.email);
        dispatch({
          type: "SET_STATE",
          state: {
            email: user.email,
            loggedIn: true,
            hasItem: false,
          },
        });
      }
    } catch (err) {
      console.error("error:", err);
      const error = err.response.data.error || "network error";
      setError(error);
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
      <h2>Login</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleLogin}>
        <label>email:</label>
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          required
        />
        <label>password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button 
          type="submit" 
          disabled={loading}
        >
          {loading?"Logging in...":"Login"}
        </button>
      </form>
        <div>
          <button
            onClick={() => navigate("/register")}
          >
            No account? Create one
          </button>
          <button
            onClick={() => navigate("/forgot")}
          >
            Forgot password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
