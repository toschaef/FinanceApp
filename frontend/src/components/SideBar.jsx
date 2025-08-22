import { Link } from 'react-router-dom';
import { useContext } from 'react';
import Context from '../Context';

const links = [
  { name: 'Dashboard', path: '/dashboard', icon: '/dash_icon.png' },
  { name: 'Accounts', path: '/manage-banks', icon: '/accounts_icon.png' },
  { name: 'Transactions', path: '/transactions', icon: '/transactions_icon.png' },
  { name: 'Investments', path: '/investments', icon: '/investments_icon.png' },
  { name: 'Assets', path: '/assets', icon: '/assets_icon.png' },
];

const SideBar = () => {
  const { showSideBar, dispatch } = useContext(Context);

  const handleLogout = () => {
    dispatch({ type: 'WIPE_STATE' });
  }

  return (
    <div className={`flex flex-col relative h-full min-h-screen ${showSideBar? 'w-60' : 'w-16'} bg-green-600 text-white transition-all duration-300 overflow-hidden`}>
      {/* sidebar toggle */}
      <div className='flex items-center p-4'>
        <div className={`absolute top-2 right-4 transition-all duration-300`}>
          <img
            src={showSideBar? '/sidebar_open.png' : '/sidebar_closed.png'}
            alt='Toggle'
            className='cursor-pointer w-8 h-8 hover:opacity-90'
            onClick={() => dispatch({
              type: 'SET_STATE',
              state: {
                showSideBar: !showSideBar
            }})}
          />
        </div>
      </div>

      {/* menu selection */}
      <nav className='flex flex-col gap-3 mt-5 px-2'>
        {links.map((item) => (
          <Link
            to={item.path}
            key={item.name}
            className={`flex items-center rounded-lg px-2 py-2 transition hover:bg-[#25d767] inset-shadow-sm inset-shadow-green-300 hover:opacity-90`}
          >
            <div className='w-8 h-8 flex-shrink-0'>
              <img src={item.icon} alt={item.name} className='w-full h-full object-contain' />
            </div>
            <div 
              className={`flex-grow overflow-hidden transition-all duration-800 ${showSideBar? 'w-full ml-2' : 'w-0'}`}
            >
              <span className={`font-semibold text-lg whitespace-nowrap ${showSideBar ? 'opacity-100' : 'opacity-0'}`}>
                {item.name}
              </span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default SideBar;
