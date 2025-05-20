import axios from 'axios';

export default function useLinkConnect({ onSuccess, onExit }) {
  return async () => {
    if (!window.Plaid) {
      console.error('Plaid not loaded');
      return;
    }
    try {
      const res = await axios.post('/api/create-link-token');
      const handler = window.Plaid.create({
        token: res.data.link_token,
        onSuccess,
        onExit,
      });
      handler.open();
    } catch (err) {
      console.error('Error initializing Plaid Link:', err);
    }
  };
}