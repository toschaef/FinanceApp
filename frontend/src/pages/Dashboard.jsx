import { useContext } from 'react';
import LinkButton from '../components/LinkButton';
import Context from '../Context';
import AreaGraph from '../components/AreaGraph'

const Dashboard = () => {
  const { hasItem, state_transactions, state_investments, state_accounts, state_assets } = useContext(Context);
  const userHasNothing = () => {
    return !hasItem && state_assets.length === 0;
  }
  const accountsWithInvestments = () => {
    const ids = new Set(state_investments.map(i => i.account_id));
    return state_accounts.filter(acc => ids.has(acc.account_id));
  };


  return (
    <div className='min-h-screen bg-gray-100 font-sans'>

      <div className='flex flex-col bg-white shadow-md py-2 pl-3'>
        <h1 className='text-md font-bold text-gray-700'>Dashboard</h1>
      </div>

      <main className='flex flex-col items-center justify-center p-4'>
        {userHasNothing()
          ? <div className='text-center p-8 bg-white rounded-lg shadow-md'>
              <h2 className='text-2xl font-medium text-gray-700 mb-4'>No accounts linked. Link one?</h2>
              <LinkButton text='Link Bank' />
            </div>
          : <div className='flex flex-col md:flex-row w-full max-w-6xl justify-center items-start gap-4'>
              <div className='w-full md:w-1/2 bg-white p-4 rounded-lg shadow-md'>
                <AreaGraph
                  title={'Overview'}
                  height={'300px'}
                  accounts={state_accounts}
                  investments={state_investments}
                  transactions={state_transactions}
                  assets={[]}
                  thumbnail={false}
                />
              </div>
              <div className='w-full md:w-1/2 bg-white p-4 rounded-lg shadow-md'>
                <AreaGraph 
                  title={'Investments'}
                  height={'300px'}
                  // only accounts with investments
                  accounts={accountsWithInvestments()}
                  investments={state_investments}
                  transactions={[]}
                  assets={[]}
                  thumbnail={false}
                />
              </div>
            </div>
        }
      </main>
    </div>
  );
};

export default Dashboard;