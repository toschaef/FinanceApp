import { useState, useContext, useEffect } from 'react';
import Context from '../Context';
import axios from 'axios';
import VerifyEmail from './VerifyEmail';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [error, setError] = useState('');
  const [showVerify, setShowVerify] = useState(false);
  const { emailVerified, dispatch } = useContext(Context);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (pass1 !== pass2) {
      setError("Passwords don't match");
      return;
    }
    try {
      dispatch({
        type: "SET_STATE",
        state: {
          email: emailInput,
        },
      });
      await axios.post('/api/send-verification-email', {
        email: emailInput,
        password: pass1,
        register: false
      });
      setShowVerify(true);
    } catch (err) {
      console.error('Error updating password', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const changePassword = async () => {
      console.log('changing p')
      try {
        await axios.patch('/api/update-password', {
          perams: { email: emailInput, pass: pass1 }
        });
        navigate('/');
      } catch (err) {
        console.log('Error changing password', err);
      }
    }
    console.log('checking');
    if (emailVerified) {
      changePassword();
    }
  }, [emailVerified]);

  return (
    <>
      {!showVerify
        ? <>
            <h1>Reset Password</h1>
            <form onSubmit={handleSubmit}>
              <label>Email</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
              />
              <br />
              <label>
                New password
              </label>
              <input
                type="password"
                onChange={(e) => setPass1(e.target.value)}
                required
              />
              <label>
                Re-enter new password
              </label>
              <input
                type="password"
                onChange={(e) => setPass2(e.target.value)}
                required
              />
              <button 
                type='submit' 
                onClick={handleSubmit}
              >
                {loading?'Loading...':'Change'}
              </button>
              {error && <p>{error}</p>}
            </form>
          </>
        : !emailVerified && 
            <VerifyEmail path='x' register={false} />
      }
    </>
  );
}

export default ForgotPassword;