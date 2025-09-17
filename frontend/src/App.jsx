import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Context from './Context';
import LinLayout from './layouts/LoggedInLayout'
import LoutLayout from './layouts/LoggedOutLayout'
import Dashboard from './pages/Dashboard';
import ManageBanks from './pages/ManageBanks';
import Login from './components/auth/Login';
import Transactions from './pages/transactions/TransactionsLayout';
import Investments from './pages/investments/Investments';
import Assets from './pages/assets/Assets';
import ForgotPassword from './components/auth/ForgotPassword';
import usePolling from './util/usePolling';

const App = () => {
  const { loggedIn } = useContext(Context);

  return (
    <Router>
      <Routes>
        <Route path='/' element={loggedIn ? <LinLayout /> : <LoutLayout />}>
          {loggedIn ? (
            <>
              <Route index element={<Dashboard />} />
              <Route path='accounts' element={<ManageBanks />} />
              <Route path='transactions' element={<Transactions />} />
              <Route path='investments' element={<Investments />} />
              <Route path='assets' element={<Assets />} />
              <Route path='*' element={<Navigate to='/' />} />
            </>
          ) : (
            <>
              <Route index element={<Login />} />
              <Route path='forgot-email' element={<ForgotPassword />} />
              <Route path='*' element={<Navigate to='/' />} />
            </>
          )}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
