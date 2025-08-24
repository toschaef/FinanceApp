import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Context from './Context';
import LinLayout from './pages/LoggedInLayout'
import LoutLayout from './pages/LoggedOutLayout'
import Dashboard from './pages/Dashboard';
import ManageBanks from './pages/ManageBanks';
import Login from './pages/Login';
import Transactions from './components/Transactions';
import Investments from './components/Investments';
import Accounts from './components/Accounts';
import Assets from './components/Assets';
import ForgotPassword from './pages/ForgotPassword';

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
