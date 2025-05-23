import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link to="/">Home</Link>
      {/* <Link to="/transactions">Transactions</Link>
      <Link to="/investments" >Investments</Link> */}
      <Link to="/manage-banks">Manage Banks</Link>
    </nav>
  );
};

export default NavBar;
