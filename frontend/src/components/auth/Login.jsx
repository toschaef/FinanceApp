import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Context from '../../Context';
import VerifyEmail from './VerifyEmail';

const Login = () => {
  const { emailVerified, login_error, dispatch } = useContext(Context);
  const [showLogin, setShowLogin] = useState(true); // toggle between login/register true: login
  const [showVerify, setShowVerify] = useState(false); // toggle showing email verification
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(login_error || '');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e)
      e.preventDefault();
    
    setError('');
    setLoading(true);

    try {
      const loginRes = await axios.post('/api/login', {
        email: emailInput,
        password,
      });

      const loginData = loginRes.data;
      console.log('login response', loginData);

      const res = await axios.get(`/api/all`, {
        params: { 
          email: emailInput, 
          user_token: loginData.user_token 
        }
      });

      const data = res.data;

      dispatch({
        type: 'SET_STATE',
        state: {
          bankNames: loginData.bankNames,
          email: loginData.email,
          hasItem: loginData.hasItem,
          loggedIn: true,
          state_accounts: data.accounts,
          state_assets: data.assets,
          state_investments: data.investments,
          state_transactions: data.transactions,
          user_token: loginData.user_token,
        },
      });
    } catch (err) {
      console.error('error:', err);
      const error = err.response.data.error || 'Network Error';
      setError(error);
    } finally {
      setLoading(false);
    }
  };

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
        type: 'SET_STATE',
        state: { email: emailInput }
      });
      setShowVerify(true);
    } catch (err) {
      console.error('error:', err);
      const error = err.response.data.error || 'network error';
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (emailVerified)
      handleLogin();
  }, [emailVerified]);

  if (showVerify)
    return <VerifyEmail register={true} />

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans'>
      <div className='bg-white p-8 rounded-lg shadow-xl w-full max-w-md'>
        <h1 className='md:text-3xl sm:text-2xl text-xl font-bold text-gray-800 mb-6 mt-3 text-center'>
          {showLogin? 'Login' : 'Register'}
        </h1>

        {error && 
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm flex items-center'>
            <svg 
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-exclamation-circle mr-2 flex-shrink-0"
              viewBox="0 0 16 16"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
            </svg>
            <span>{error}</span>
          </div>
        }

        <form 
          onSubmit={showLogin? handleLogin : handleRegister}
          className='space-y-4'
        >
          <div>
            <label htmlFor='email' className='block text-gray-700 sm:text-sm text-xs font-semibold mb-2'>Email:</label>
            <input
              id='email'
              className='shadow-sm appearance-none border rounded-md w-[calc(100%-12px)] ml-2 py-2 px-3 text-gray-700 sm:text-sm text-xs leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 ease-in-out'
              type='email'
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              placeholder='your.email@example.com'
            />
          </div>
          <div>
            <label htmlFor='password' className='block text-gray-700 sm:text-sm text-xs font-semibold mb-2'>Password:</label>
            <input
              id='password'
              className='shadow-sm appearance-none border rounded-md w-[calc(100%-12px)] ml-2 py-2 px-3 text-gray-700 sm:text-sm text-xs leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 ease-in-out'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder='••••••••'
            />
          </div>
          <div className='flex justify-center !my-6'>
            <button
              className='w-3/5 mx-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
              type='submit'
              disabled={loading}
            >
              {loading
                ? <div className='flex items-center justify-center space-x-2'>
                    <span>
                      {showLogin
                        ? 'Logging in...'
                        : 'Registering...'
                      }
                    </span>
                    <svg
                      className='animate-spin h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                  </div>
                : showLogin? 'Login' : 'Register'
              }
            </button>
          </div>
        </form>

        <div className='flex flex-col sm:flex-row justify-between items-center sm:text-sm text-xs'>
          <button
            onClick={() => setShowLogin(!showLogin)}
            className='text-green-600 hover:text-green-800 hover:underline'
          >
            {showLogin
              ? 'No account? Create one'
              : 'Have an account? Login'
            }
          </button>
          <button
            onClick={() => navigate('/forgot-email')}
            className='text-green-600 hover:text-green-800 hover:underline'
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
