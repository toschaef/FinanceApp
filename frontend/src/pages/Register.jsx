import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Context from '../Context'
import axios from 'axios';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { dispatch } = useContext(Context);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/register', { email, password });
      dispatch({
        type: "SET_STATE",
        state: { email }
      });
      navigate('/verify-email');
    } catch (err) {
      console.log("error:", err);
      const error = err.response?.data?.error || err.response?.data?.message || "network error";
      setError(error);
      setLoading(false);
    }
  };
  

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>email:</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
        >
          {loading ? 'Registering…' : 'Register'}
        </button>
      </form>
      <button onClick={() => navigate("/")}>Login</button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Register;
