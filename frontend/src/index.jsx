import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from './Context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'))
  .render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Provider >
          <App />
        </Provider>
      </QueryClientProvider>
    </React.StrictMode>
);