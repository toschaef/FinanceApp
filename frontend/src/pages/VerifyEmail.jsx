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
      if (res.status === 201) {
        dispatch({
          type: 'SET_STATE',
          state: {
            emailVerified: true,
            user_token: res.data.user_token,
          },
        });
        // path: 'x' === no redirect
        if (!path && path !== 'x') {
          navigate('/'); // redirect to input path
        } else if (path !== 'x') {
          navigate(`/${path}`); // redirect to input path
        }
      }
    } catch (err) {
      console.log('Error logging in', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans'>
      <div className='bg-white p-8 rounded-lg shadow-xl w-full max-w-md'>

        <h1 className='text-2xl font-bold text-gray-800 mb-6 text-center'>
          Verify Your Email
        </h1>

        <p className='text-sm text-gray-600 mb-4 text-center'>
          Enter the code emailed to <span className='font-semibold'>{email}</span>
        </p>

        {error && (
          <p className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm'>
            {error}
          </p>
        )}

        <form onSubmit={handleVerification} className='space-y-4'>
          <div>
            <label
              htmlFor='verificationCode'
              className='block text-gray-700 text-sm font-semibold mb-2'
            >
              Verification Code
            </label>
            <input
              id='verificationCode'
              type='text'
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              placeholder='123456'
              className='shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out'
            />
          </div>

          <div className='flex justify-center'>
            <button
              type='submit'
              className='w-3/5 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={loading}
            >
              {loading
                ? <div className='flex items-center justify-center space-x-2'>
                    <span>Verifying...</span>
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
                : 'Verify'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;