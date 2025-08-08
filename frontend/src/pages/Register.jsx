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
        type: 'SET_STATE',
        state: { email: emailInput }
      });
    } catch (err) {
      console.error('error:', err);
      const error = err.response.data.error || 'network error';
      setError(error);
      setLoading(false);
    }
  };

  return (
    <>
    {!email
      ? <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans'>
          <div className='bg-white p-8 rounded-lg shadow-xl w-full max-w-md'>
            <h1 className='text-3xl font-bold text-gray-800 mb-6 text-center'>Register</h1>

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

            <form onSubmit={handleRegister} className='space-y-4'>
              <div>
                <label className='block text-gray-700 text-sm font-semibold mb-2'>Email:</label>
                <input
                  type='email'
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  placeholder='your.email@example.com'
                  className='shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out'
                />
              </div>
              <div>
                <label className='block text-gray-700 text-sm font-semibold mb-2'>Password:</label>
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder='********'
                  className='shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 ease-in-out'
                />
              </div>

              <div className='flex justify-center'>
                <button
                  type='submit'
                  disabled={loading}
                  className='w-3/5 mx-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {loading ? (
                    <div className='flex items-center justify-center space-x-2'>
                      <span>Registering...</span>
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
                  ) : (
                    'Register'
                  )}
                </button>
              </div>
            </form>

            <div className='flex flex-col sm:flex-row justify-between items-center mt-6 text-sm'>
              <button
                onClick={() => navigate('/')}
                className='text-green-600 hover:text-green-800 hover:underline mb-2 sm:mb-0'
              >
                Have an account? Login
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
      : <VerifyEmail path='' register={true} />
    }
    </>
  );
};

export default Register;