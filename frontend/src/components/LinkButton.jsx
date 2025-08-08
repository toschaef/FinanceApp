import { useContext, useState } from 'react';
import useLinkConnect from '../util/useLinkConnect'
import Context from '../Context';
import axios from 'axios';

const LinkButton = ({ text }) => {
  const { email, bankNames, dispatch, user_token, refreshContext } = useContext(Context);
  const [loading, setLoading] = useState(false);

  const createLink = useLinkConnect({
    onSuccess: async (public_token) => {
      try {
        const res = await axios.post('/api/set-access-token', {
          public_token,
          email,
          user_token,
        });
        dispatch({
          type: 'SET_STATE',
          state: {
            hasItem: true,
            bankNames: [...bankNames, res.data.bank_name],
          }
        });
        refreshContext(email, user_token);
      } catch (err) {
        console.error('Error setting access token', err);
      } finally {
        setLoading(false);
      }
    }, onExit: () => setLoading(false)
    }
  );

  const handleClick = () => {
    setLoading(true);
    createLink();
  }

  return (
    <button
      className='w-2/5 mx-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
      onClick={handleClick}
      disabled={loading}
    >
      {loading
      ? <div className='flex items-center justify-center space-x-2'>
          <span>Linking Bank...</span>
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
      : text
      }
    </button>
  )
};

export default LinkButton;