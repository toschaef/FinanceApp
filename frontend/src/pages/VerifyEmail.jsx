import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Context from '../Context';

const VerifyEmail = ({ path }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { email, dispatch } = useContext(Context);
  const navigate = useNavigate();

  const handleVerification = async (e) => {
    if (!email) navigate('/');
    setLoading(true);
    setError('');
    e.preventDefault();
    try {
      const res = await axios.post('/api/verify-and-register', {
        email,
        code: verificationCode,
      });
      if (res.status === 200) {
        dispatch({
          type: "SET_STATE",
          state: {
            emailVerified: true,
          },
        });
      }
      navigate(`/${path}`); // redirects to input path
    } catch (err) {
      console.log("Error logging in", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h3>Enter code emailed to {email}</h3>
        <form onSubmit={handleVerification}>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
          <button 
            type="submit"
            disabled={loading}
          >
            {loading?"Verifying...":"Verify"}
          </button>
        </form>
      </div>
      {error && <p>{error}</p>}
    </>
  );
  
};

export default VerifyEmail;