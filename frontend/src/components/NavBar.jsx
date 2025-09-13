import { useState } from 'react';
import { Link } from 'react-router-dom';

const links = [
  { name: 'Dash', path: '/dashboard', icon: '/dash_icon.png' },
  { name: 'Acct', path: '/accounts', icon: '/accounts_icon.png' },
  { name: 'Txns', path: '/transactions', icon: '/transactions_icon.png' },
  { name: 'Invst', path: '/investments', icon: '/investments_icon.png' },
  { name: 'Ast', path: '/assets', icon: '/assets_icon.png' },
];

const NavBar = () => {
  const [fullTopBar, setFullTopBar] = useState(false);

  return (
    <div
      className={`fixed bottom-0 left-0 flex flex-row w-screen items-end bg-green-600 transition-all duration-300 ease-in-out ${
        fullTopBar ? 'h-28' : 'h-14'
      }`}
    >
      <nav className='flex flex-row w-full h-full'>
        {links.map((item) => (
          <Link
            to={item.path}
            key={item.name}
            className='flex-1 flex flex-col items-center justify-center transition hover:bg-[#25d767] hover:opacity-90'
          >
            <div className='w-6 h-6'>
              <img
                src={item.icon}
                alt={item.name}
                className='w-full h-full object-contain'
              />
            </div>
            <span
              className={`text-white font-semibold text-xs transition-opacity duration-300 ${
                fullTopBar ? 'opacity-100 mt-1' : 'opacity-0 h-0'
              }`}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </nav>
      <div className='absolute right-2 bottom-2'>
        <img
          src='/burger_icon.png'
          alt='Toggle'
          className='cursor-pointer w-6 h-6 hover:opacity-90'
          onClick={() => setFullTopBar((p) => !p)}
        />
      </div>
    </div>
  );
};

export default NavBar;
