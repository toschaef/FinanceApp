import { React, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LinkButton from '../components/LinkButton';
import Context from '../Context';
import NavBar from '../components/NavBar';
import Transactions from '../components/Transactions';
import Investments from '../components/Investments';
import Accounts from '../components/Accounts';
import AreaGraph from '../components/AreaGraph'

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

  return (
    <div>
      {/* todo: homepage */}
      <h1>Home Page</h1>
      <NavBar />
      
      <header>
        <button
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>
      <main>
        {!hasItem ?
        <>
          <h2>No account linked. Link one?</h2>
          <LinkButton text="Link Bank" />
        </>
        :
        <>
          <div style={{ width: "100%", height: 300 }}>
            <AreaGraph />
          </div>
          {/* <div>
              {!t && (
                <button
                  onClick={() => setT(true)}
                >
                  Show Transactions
                </button>
              )}
              {!i && (
                <button
                  onClick={() => setI(true)}
                >
                  Show Investments
                </button>
              )}
              {!a && (
                <button
                  onClick={() => setA(true)}
                >
                  Show Accounts
                </button>
              )}
            </div>
            <div>
              {t  && <Transactions />}
              {i  && <Investments  />}
              {a && <Accounts     />}
            </div> */}
        </>
        }
      </main>
    </div>
  );
};

export default Home;
