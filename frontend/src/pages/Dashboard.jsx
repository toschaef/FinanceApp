import { useContext } from 'react';
import LinkButton from '../components/LinkButton';
import Context from '../Context';
import AreaGraph from '../components/AreaGraph';
import HeatMap from '../components/HeatMap';
// import Transactions from '../components/Transactions';

const Dashboard = () => {
  const { hasItem, isMobileView, state_transactions, state_investments, state_accounts, state_assets } = useContext(Context);

  const userHasNothing = () => {
    return !hasItem && state_transactions.length === 0 && state_assets.length === 0;
  }

  const userHasInvestment = () => {
    return Boolean(state_investments.length);
  }

  const accountsWithInvestments = () => {
    const ids = new Set(state_investments.map(i => i.account_id));
    return state_accounts.filter(acc => ids.has(acc.account_id));
  };

  const hasLocationData = () => {
      return state_transactions.some(t => t.lat && t.lng);
  }

  return (
    <div className='font-sans'>
      <div className='flex flex-col justify-center p-4'>
        {userHasNothing()
          ? <div className='mx-auto text-center p-8 bg-white rounded-lg shadow-md max-w-[400px]'>
              <h2 className='text-2xl font-semibold text-gray-700 mb-4'>No accounts linked. Link one?</h2>
              <LinkButton text='Link Bank' />
            </div>
          : <div className='flex flex-col items-center gap-4 w-full'>
              <div className='flex h-full md:flex-row flex-col w-full max-w-7xl justify-center items-stretch gap-4 transition-all duration-300 ease-in-out'>
                <div className='flex items-center md:w-1/2 w-full bg-white p-4 rounded-lg shadow-md transition-all duration-200'>
                  <AreaGraph
                    title='Accounts Overview'
                    subtitle='Total Balance'
                    height={isMobileView? '125px' : '250px'}
                    width='90%'
                    accounts={state_accounts}
                    investments={state_investments}
                    transactions={state_transactions}
                    assets={[]}
                    thumbnail={false}
                    timespan='x'
                  />
                </div>
                {userHasInvestment() &&
                <div className='flex items-center md:w-1/2 w-full bg-white p-4 rounded-lg shadow-md transition-all duration-200'>
                    <AreaGraph 
                      title='Investment Overview'
                      subtitle='Investment Balance'
                      height={isMobileView? '125px' : '250px'}
                      width='90%'
                      accounts={accountsWithInvestments()}
                      investments={state_investments}
                      transactions={[]}
                      assets={[]}
                      thumbnail={false}
                      timespan='x'
                    />
                  </div>
                }
              </div>

              {hasLocationData() &&
                <div className='w-full max-w-7xl bg-white p-4 rounded-lg shadow-md'>
                    <h3 className='text-lg font-semibold text-gray-700 mb-4'>Spending Heatmap</h3>
                    <div className='rounded-lg overflow-hidden h-[400px]'>
                        <HeatMap />
                    </div>
                </div>
              }
              
              {/* <Transactions /> */}
            </div>
        }
      </div>
    </div>
  );
};

export default Dashboard;
