import { Link } from 'react-router-dom';
import { useContext } from 'react';
import Context from '../Context';

const NavBar = () => {
  const { dispatch } = useContext(Context);

  const handleLogout = () => {
    dispatch({ type: "WIPE_STATE" });
    navigate('/');
  }

return (
    <nav className="flex items-center justify-between p-1 bg-gray-50 shadow-sm border-b border-gray-200">
      <div className="flex items-center space-x-6">
        <Link 
          to="/" 
          className="text-gray-700 hover:text-green-600 font-medium text-lg transition-colors duration-200"
        >
          Home
        </Link>
        <Link 
          to="/accounts" 
          className="text-gray-700 hover:text-green-600 font-medium text-lg transition-colors duration-200"
        >
          Accounts
        </Link>
        <Link 
          to="/transactions" 
          className="text-gray-700 hover:text-green-600 font-medium text-lg transition-colors duration-200"
        >
          Transactions
        </Link>
        <Link 
          to="/investments" 
          className="text-gray-700 hover:text-green-600 font-medium text-lg transition-colors duration-200"
        >
          Investments
        </Link>
        <Link 
          to="/assets" 
          className="text-gray-700 hover:text-green-600 font-medium text-lg transition-colors duration-200"
        >
          Assets
        </Link>
        <Link 
          to="/manage-banks" 
          className="text-gray-700 hover:text-green-600 font-medium text-lg transition-colors duration-200"
        >
          Manage Banks
        </Link>
      </div>

      <button 
        onClick={handleLogout}
        className="px-4 my-auto h-4/5 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
      >
        Logout
      </button>
    </nav>
  );
};

export default NavBar;
