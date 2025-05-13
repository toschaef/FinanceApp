import { React, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LinkButton from '../components/LinkButton';
import Context from '../Context';
import NavBar from '../components/NavBar';
import Transactions from '../components/Transactions';
import Investments from '../components/Investments';
import Accounts from '../components/Accounts';

const Home = () => {
  const { hasItem, dispatch } = useContext(Context);
  const navigate = useNavigate();
  const [t, setT] = useState(false);
  const [i, setI] = useState(false);
  const [a, setA] = useState(false);

  const handleLogout = () => {
    dispatch({ type: "WIPE_STATE" });
    navigate('/');
  }
  
  // this is temporary!!
  const renderT = () => {
    setT(true);
  }
  const renderI = () => {
    setI(true);
  }
  const renderA = () => {
    setA(true);
  }

  return (
    <div>
      {/* todo: homepage */}
      <h1>Home Page</h1>
      <NavBar />
      <button onClick={handleLogout}>Logout</button>
      {!hasItem ?
      <>
        <h3>No account linked. Link one?</h3>
        <LinkButton text={"Link Bank"} />
      </>
      :
      <>
        {!t &&
        <button onClick={renderT}>Render Transactions</button>}
        {t && <Transactions />}
        {!i &&
        <button onClick={renderI}>Render Investments</button>}
        {i && <Investments />}
        {!a &&
        <button onClick={renderA}>Render Accounts</button>}
        {a && <Accounts />}
      </>
      }
    </div>
  );
};

export default Home;
