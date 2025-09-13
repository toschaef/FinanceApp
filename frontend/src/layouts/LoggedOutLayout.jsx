import { Outlet, useLocation } from 'react-router-dom';
import Context from '../Context';

const LoutLayout = () => {
  const showLogin = useLocation().pathname === '/login';

  return (
    <div className='min-h-screen'>
      <Outlet />
    </div>
  );
}

export default LoutLayout;