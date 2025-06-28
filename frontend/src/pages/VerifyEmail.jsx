import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Context from '../Context';

const VerifyEmail = ({ path, register }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { email, dispatch } = useContext(Context);
  const navigate = useNavigate();

  const handleVerification = async (e) => {
    setLoading(true);
    setError('');
    e.preventDefault();
    try {
      console.log('email', email);
      const res = await axios.post('/api/verify-email', {
        email,
        code: verificationCode,
        register,
      });
      if (res.status === 204) {
        dispatch({
          type: "SET_STATE",
          state: {
            emailVerified: true,
          },
        });
      }

      // path: 'x' === no redirect
      if (!path && path !== 'x') {
        navigate('/'); // redirect to input path
      } else if (path !== 'x') {
        navigate(`/${path}`); // redirect to input path
      }
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