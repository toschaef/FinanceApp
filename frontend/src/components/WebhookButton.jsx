import { useState, useContext } from 'react';
import Context from '../Context';
import axios from 'axios';

const WebhookButton = () => {
  const [loading, setLoading] = useState(false);
  const { email } = useContext(Context);

  const fire = async () => {
    setLoading(true);
    try {
      await axios.post('/api/fire-webhook', {
        email,
      });
    } catch (err) {
      console.error('Error firing webhook', err);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      {loading && <p>Loading...</p>}
      <button onClick={fire}>Fire Webhook</button>
    </>
  );
}

export default WebhookButton;