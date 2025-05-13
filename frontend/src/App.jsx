import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Context from './Context';
import Home from './pages/Home';
import ManageBanks from './pages/ManageBanks';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Transactions from './components/Transactions';
import Investments from './components/Investments';

const App = () => {
  const { loggedIn } = useContext(Context);

  return (
    <Router>
      <Routes>
        {!loggedIn ? (
          <>
            <Route path='/' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/verify-email' element={<VerifyEmail path='' />} />
            {/* <Route path='/forgot-email' element={<ForgotEmail />} /> */}
            <Route path='*' element={<Navigate to='/' />} />
          </>
        ) : (
          <>
            <Route path='/' element={<Home />} />
            <Route path='/manage-banks' element={<ManageBanks />} />
            <Route path='/transactions' element={<Transactions />} />
            <Route path='/investments' element={<Investments />} />
            <Route path='*' element={<Navigate to='/home' />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
