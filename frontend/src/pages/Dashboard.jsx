import { useContext } from 'react';
import LinkButton from '../components/LinkButton';
import Context from '../Context';
import AreaGraph from '../components/AreaGraph'

const Dashboard = () => {
  const { hasItem, state_transactions, state_investments, state_accounts, state_assets } = useContext(Context);
  const userHasNothing = () => {
    return !hasItem && state_assets.length === 0;
  }
  const userHasInvestment = () => {
    return Boolean(state_investments.length);
  }

  const accountsWithInvestments = () => {
    const ids = new Set(state_investments.map(i => i.account_id));
    return state_accounts.filter(acc => ids.has(acc.account_id));
  };


  return (
    <div className='font-sans'>
      <div className='flex flex-col items-center justify-center p-4'>
        {userHasNothing()
          ? <div className='text-center p-8 bg-white rounded-lg shadow-md'>
              <h2 className='text-2xl font-medium text-gray-700 mb-4'>No accounts linked. Link one?</h2>
              <LinkButton text='Link Bank' />
            </div>
          : <div className='flex flex-col md:flex-row w-full justify-center items-start gap-4'>
              <div className='max-w-[800px] md:w-[50%] sm:w-full bg-white p-4 rounded-lg shadow-md'>
                <AreaGraph
                  title={'Accounts Overview'}
                  subtitle={'Total Balance'}
                  height={'250px'}
                  accounts={state_accounts}
                  investments={state_investments}
                  transactions={state_transactions}
                  assets={[]}
                  thumbnail={false}
                />
              </div>
              {userHasInvestment() &&
                <div className='max-w-[800px] md:w-[50%] sm:w-full bg-white p-4 rounded-lg shadow-md'>
                  <AreaGraph 
                    title={'Investment Overview'}
                    subtitle={'Investment Balance'}
                    height={'250px'}
                    accounts={accountsWithInvestments()}
                    investments={state_investments}
                    transactions={[]}
                    assets={[]}
                    thumbnail={false}
                  />
                </div>
              }
            </div>
        }
      </div>
    </div>
  );
};

export default Dashboard;