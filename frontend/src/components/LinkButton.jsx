import React, { useContext } from 'react';
import useLinkConnect from '../util/useLinkConnect'
import Context from '../Context';
import axios from 'axios';

const LinkButton = ({ text }) => {
  const { email, bankNames, dispatch, user_token, refreshContext } = useContext(Context);

  const handleClick = useLinkConnect({
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
      }
    },
    onExit: () => console.log('plaid window closed'),
  });

  return <button onClick={handleClick}>{text}</button>;
};

export default LinkButton;