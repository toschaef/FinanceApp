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
  const { emailVerified, user_token, dispatch } = useContext(Context);
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
        type: 'SET_STATE',
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
      try {
        await axios.patch('/api/update-password', {
          perams: { 
            email: emailInput, 
            pass: pass1, 
            user_token, 
          }
        });
        dispatch({
          type: 'SET_STATE',
          state: {
            emailVerified: false,
          }
        })
        navigate('/');
      } catch (err) {
        console.log('Error changing password', err);
      }
    }
  
    if (emailVerified) {
      changePassword();
    }
  }, [emailVerified]);

  return (
    <>
      {!showVerify
        ? <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans'>
            <div className='relative bg-white p-8 rounded-lg shadow-xl w-full max-w-md'>

              <button
                onClick={() => navigate('/')}
                className='absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none'
                aria-label='Close'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>

              <h1 className='text-3xl font-bold text-gray-800 mt-2 mb-6 text-center'>Reset Password</h1>

              {error && (
                <p className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm'>
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label htmlFor='email' className='block text-gray-700 text-sm font-semibold mb-2'>Email:</label>
                  <input
                    id='email'
                    type='email'
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    placeholder='your.email@example.com'
                    className='shadow-sm appearance-none border rounded-md ml-2 w-[calc(100%-12px)] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out'
                  />
                </div>

                <div>
                  <label htmlFor='pass1' className='block text-gray-700 text-sm font-semibold mb-2'>New Password:</label>
                  <input
                    id='pass1'
                    type='password'
                    value={pass1}
                    onChange={(e) => setPass1(e.target.value)}
                    required
                    placeholder='••••••••'
                    className='shadow-sm appearance-none border rounded-md ml-2 w-[calc(100%-12px)] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 ease-in-out'
                  />
                </div>

                <div>
                  <label htmlFor='pass2' className='block text-gray-700 text-sm font-semibold mb-2'>Re-enter Password:</label>
                  <input
                    id='pass2'
                    type='password'
                    value={pass2}
                    onChange={(e) => setPass2(e.target.value)}
                    required
                    placeholder='••••••••'
                    className='shadow-sm appearance-none border rounded-md ml-2 w-[calc(100%-12px)] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 ease-in-out'
                  />
                </div>

                <div className='flex justify-center mt-2'>
                  <button
                    type='submit'
                    className='w-3/5 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
                    disabled={loading}
                  >
                    {loading ? (
                      <div className='flex items-center justify-center space-x-2'>
                        <span>Changing...</span>
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
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        : !emailVerified && 
            <VerifyEmail path='x' register={false} />
      }
    </>
  );
}

export default ForgotPassword;