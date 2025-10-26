import { Link } from 'react-router-dom';
import { useContext } from 'react';
import Context from '../Context';

const links = [
  { name: 'Dashboard', path: '/dashboard', icon: '/dash_icon.png' },
  { name: 'Accounts', path: '/accounts', icon: '/accounts_icon.png' },
  { name: 'Transactions', path: '/transactions', icon: '/transactions_icon.png' },
  { name: 'Investments', path: '/investments', icon: '/investments_icon.png' },
  { name: 'Assets', path: '/assets', icon: '/assets_icon.png' },
];

const SideBar = () => {
  const { fullSideBar, dispatch } = useContext(Context);

  const handleLogout = () => {
    dispatch({ type: 'WIPE_STATE' });
  }

  return (
    <div className={'flex flex-col p-4 relative h-full min-h-screen w-full bg-green-600 text-white transition-all duration-300 overflow-hidden'}>
      {/* sidebar toggle */}
      <div className={`absolute top-4 right-4 transition-all duration-300`}>
        <img
          src={fullSideBar? '/sidebar_open.png' : '/sidebar_closed.png'}
          alt='Toggle'
          className='cursor-pointer w-8 h-8 hover:opacity-90'
          onClick={() => dispatch({
            type: 'SET_STATE',
            state: {
              fullSideBar: !fullSideBar
          }})}
        />
      </div>

      {/* menu selection */}
      <nav className='flex flex-col gap-5 mt-14'>
        {links.map((item) => (
          <Link
            to={item.path}
            key={item.name}
            className={`flex items-center rounded-lg transition hover:bg-[#25d767] inset-shadow-sm inset-shadow-green-300 hover:opacity-90`}
          >
            <div className='w-8 h-8 flex-shrink-0'>
              <img src={item.icon} alt={item.name} className='w-full h-full object-contain' />
            </div>
            <div className={`flex-grow overflow-hidden transition-[width] duration-300 ease-in-out ${fullSideBar? 'w-full ml-2' : 'w-0'}`}>
              <span className={`font-semibold text-lg whitespace-nowrap transition-opacity duration-200 ease-in-out delay-150 ${fullSideBar ? 'opacity-100' : 'opacity-0'}`}>
                {item.name}
              </span>
            </div>
          </Link>
        ))}
      </nav>

      <button
          onClick={() => handleLogout()}
          className={`absolute bottom-4 left-4 right-4 flex items-center rounded-lg py-2 transition hover:bg-[#25d767] inset-shadow-sm inset-shadow-green-300 hover:opacity-90`}
        >
          <div className='w-8 h-8 flex-shrink-0'>
            <img src='/logout_icon.png' alt='Logout' className='w-full h-full object-contain'/>
          </div>
          <div className={`flex-grow overflow-hidden transition-[width] duration-300 ease-in-out ${fullSideBar? 'w-full ml-2' : 'w-0'}`}>
            <span className={`font-semibold text-lg whitespace-nowrap transition-opacity duration-200 ease-in-out delay-150 ${fullSideBar ? 'opacity-100' : 'opacity-0'}`}>
              Logout
            </span>
          </div>
        </button>
    </div>
  );
};

export default SideBar;