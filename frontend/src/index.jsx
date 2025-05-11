import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from './Context';

const root = ReactDOM.createRoot(document.getElementById('root'))
  .render(
    <Provider >
      <App />
    </Provider>
);