import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Context from '../Context';

const Login = () => {
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { dispatch } = useContext(Context);
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
        console.log('logged in with item');
        const res = await axios.get(`/api/all`, {
          params: { email: emailInput },
        });

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
          },
        });
      } else {
        console.log('logged in no item');
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
      console.log("error:", err);
      const error = err.response?.data?.error || err.response?.data?.message || "network error";
      setError(error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
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
      <button onClick={() => navigate("/register")}>Register</button>
      {error && <p>{error}</p>}
    </div>
  );
  
};

export default Login;
