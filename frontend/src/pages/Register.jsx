import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Context from '../Context'
import axios from 'axios';
import VerifyEmail from './VerifyEmail';

const Register = () => {
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { email, dispatch } = useContext(Context);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/send-verification-email', { 
        email: emailInput, 
        password, 
        register: true 
      });
      dispatch({
        type: "SET_STATE",
        state: { email: emailInput }
      });
    } catch (err) {
      console.error("error:", err);
      const error = err.response.data.error || "network error";
      setError(error);
      setLoading(false);
    }
  };
  

  return (
    <>
    {!email
      ? <>
          <h2>Register</h2>
          {error && <p>{error}</p>}
          <form onSubmit={handleRegister}>
            <div>
              <label>email:</label>
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
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
              {loading
                ? <>
                    Registering...
                  </>
                : "Register"
              }
            </button>
          </form>
          <button onClick={() => navigate("/")}>Login</button>
          <button
            onClick={() => navigate("/forgot")}
          >
            Forgot password
          </button>
        </>
      : <VerifyEmail path='' register={true} />
    }
    </>
  );
};

export default Register;