import { useContext } from 'react';
import LinkButton from '../components/LinkButton';
import Context from '../Context';
import NavBar from '../components/NavBar';
import AreaGraph from '../components/AreaGraph'

const Dashboard = () => {
  const { hasItem, state_assets } = useContext(Context);
  const userHasNothing = () => {
    return !hasItem && state_assets.length === 0;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar />
      <h1 className="text-4xl font-bold text-gray-800 text-center mt-8 mb-6">Dashboard</h1>

      <main className="flex flex-col items-center justify-center p-4">
        {userHasNothing()
          ? <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">No accounts linked. Link one?</h2>
              <LinkButton text="Link Bank" />
            </div>
          : <div className='flex flex-col md:flex-row w-full max-w-6xl justify-center items-start gap-4'>
              <div className='w-full md:w-1/2 bg-white p-4 rounded-lg shadow-md'>
                <AreaGraph />
              </div>
              <div className='w-full md:w-1/2 bg-white p-4 rounded-lg shadow-md'>
                <AreaGraph />
              </div>
            </div>
        }
      </main>
    </div>
  );
};

export default Dashboard;