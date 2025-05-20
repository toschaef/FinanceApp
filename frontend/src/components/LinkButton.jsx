import React, { useContext } from 'react';
import useLinkConnect from '../util/useLinkConnect'
import Context from '../Context';
import axios from 'axios';

const LinkButton = ({ text }) => {
  const { email, bankNames, dispatch } = useContext(Context);

  const handleClick = useLinkConnect({
    onSuccess: async (publicToken, meta) => {
      try {
        const res = await axios.post('/api/set-access-token', {
          public_token: publicToken,
          email,
        });
        dispatch({
          type: "SET_STATE",
          state: {
            hasItem: true,
            bankNames: [...bankNames, res.data.bank_name],
          }
        });
      } catch (err) {
        console.error('Error setting access token', err);
      }
    },
    onExit: () => console.log('plaid window closed'),
  });

  return <button onClick={handleClick}>{text}</button>;
};

export default LinkButton;