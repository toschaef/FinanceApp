import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc', marginBottom: '5' }}>
      <Link to="/">Home</Link>
      <Link to="/accounts" >Accounts</Link>
      <Link to="/transactions">Transactions</Link>
      <Link to="/investments" >Investments</Link>
      <Link to="/assets">Assets</Link>
      <Link to="/manage-banks">Manage Banks</Link>
    </nav>
  );
};

export default NavBar;
