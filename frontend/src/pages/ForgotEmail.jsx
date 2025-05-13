import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Context from '../Context';

const ForgotEmail = () => {
  const [inputEmail, setInputEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { email, dispatch } = useContext(Context);
  const navigate = useNavigate();

  const handleForgotEmail = async (e) => {
    setLoading(true);
    setError('');
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/verify-and-register', {
        email,
        code: verificationCode,
      });
      dispatch({
        type: "SET_STATE",
        state: {
          emailVerified: true,
        },
      });
      setLoading(false);
      navigate('/verify-email'); // redirects to verify email
    } catch (err) {
      setLoading(false);
      console.log("Error logging in", err);
      setError(err);
    }
  };

  return (
    <>
      <div>
        {!email?
        <>
        <SetEmail />
        </>
        :
        <>
        {}
        <h3>Enter code emailed to {email}</h3>
        <form onSubmit={handleForgotEmail}>
          <input
            type="text"
            value={email}
            onChange={(e) => setInputEmail(e.target.value)}
            required
          />
          <button 
            type="submit"
            disabled={loading}
          >
            {loading?"Verifying...":"Verify"}
          </button>
        </form>
        </>
        }
      </div>
      {error && <p>{error}</p>}
    </>
    
  );
};

export default ForgotEmail;