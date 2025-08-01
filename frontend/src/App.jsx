import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Context from './Context';
import Dashboard from './pages/Dashboard';
import ManageBanks from './pages/ManageBanks';
import Login from './pages/Login';
import Register from './pages/Register';
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
        {!loggedIn
          ? <>
              <Route path='/' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/forgot-email' element={<ForgotPassword />} />
              <Route path='*' element={<Navigate to='/' />} />
            </>
          : <>
              <Route path='/' element={<Dashboard />} />
              <Route path='/manage-banks' element={<ManageBanks />} />
              <Route path='/accounts' element={<Accounts />} />
              <Route path='/transactions' element={<Transactions />} />
              <Route path='/investments' element={<Investments />} />
              <Route path='/assets' element={<Assets />} />
              <Route path='*' element={<Navigate to='/home' />} />
            </>
        }
      </Routes>
    </Router>
  );
};

export default App;
