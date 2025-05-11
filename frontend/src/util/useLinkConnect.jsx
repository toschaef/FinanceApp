import { useCallback } from 'react';

export default function useLinkConnect({ onSuccess, onExit }) {
  return async () => {
    const res = await fetch('/api/create_link_token', { method: 'POST' });
    if (!res.ok) throw new Error('failed to fetch token');

    const { link_token } = await res.json();
    const handler = window.Plaid.create({ token: link_token, onSuccess, onExit });
    if (!window.Plaid) {
      console.error('plaid window undefined');
      return;
    }
    try {
      handler.open();
    } catch (err) {
      console.error('error opening plaid window', err);
    }
  };
}
