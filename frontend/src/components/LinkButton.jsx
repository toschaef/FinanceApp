import React, { useContext } from 'react';
import useLinkConnect from '../util/useLinkConnect'
import Context from '../Context';

const LinkButton = ({ text }) => {
  const { dispatch, email } = useContext(Context);

  const handleClick = useLinkConnect({
    onSuccess: async (publicToken, meta) => {
      try {
        const res = await fetch('/api/set_access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ public_token: publicToken, email }),
        });
    
        if (!res.ok) {
          throw new Error('Error setting access token');
        }
    
        const data = await res.json();
        dispatch({
          type: "SET_STATE",
          hasItem: true,
          bankNames: [...bankNames, data.bank_name],
        });
      } catch (error) {
        console.error('Error setting access token:', error);
      }
    },    
    onExit: () => console.log('plaid window closed'),
  });

  return <button onClick={handleClick}>{text}</button>;
};

export default LinkButton;