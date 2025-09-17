import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const usePolling = ({ state, dispatch, refreshContext }) => {

  const fetchStatus = async ({ queryKey }) => {
    const [_key, currentEmail, currentToken] = queryKey;
    try {
      const { data } = await axios.get('/api/status', {
        params: { email: currentEmail, user_token: currentToken }
      });

      if (data.user_token && data.user_token !== currentToken) {
        console.log('New token received, updating context.');
        dispatch({ 
          type: 'SET_STATE',
          state: {
            user_token: data.user_token,
            polling_interval: 15000, // reset to 15 seconds
          }
        });
      }

      if (data.needs_update) {
        refreshContext(currentEmail, data.user_token);
      }

      return data;
    } catch (err) {
      if (err.response?.status === 401) {
        dispatch({
          type: 'WIPE_AND_SET_STATE',
          state: { login_error: 'Session Expired, Please Log In Again.' }
        });
      }
      if (err.response?.status === 500) {
        dispatch({
          type: 'WIPE_AND_SET_STATE',
          state: { login_error: 'Internal server error.' }
        });
      }
      return null;
    }
  };

  useQuery({
    queryKey: ['pollEndpoint', state.email, state.user_token],
    queryFn: fetchStatus,
    refetchInterval: state.polling_interval,
    refetchIntervalInBackground: true,
    enabled: state.loggedIn && !!state.user_token,
    retry: false,
  });
};

export default usePolling;