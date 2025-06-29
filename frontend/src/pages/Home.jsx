import { React, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LinkButton from '../components/LinkButton';
import Context from '../Context';
import NavBar from '../components/NavBar';
import AreaGraph from '../components/AreaGraph'

const Home = () => {
  const { hasItem, state_assets, dispatch } = useContext(Context);
  const navigate = useNavigate();
  const userHasNothing = () => {
    return !hasItem && state_assets.length === 0;
  }

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
        {userHasNothing()?
        <>
          <h2>No accounts linked. Link one?</h2>
          <LinkButton text="Link Bank" />
        </>
        :
        <>
          <div>
            <AreaGraph />
          </div>
        </>
        }
      </main>
    </div>
  );
};

export default Home;
