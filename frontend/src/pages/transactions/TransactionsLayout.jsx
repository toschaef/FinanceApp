import TransactionsPortal from './TransactionsPortal';
import PieGraph from '../../components/PieGraph';
import { useContext } from 'react';
import Context from '../../Context';

const Transactions = () => {
  const { state_accounts } = useContext(Context);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 w-full h-full overflow-auto'>
      <div className='h-full overflow-hidden'>
        <TransactionsPortal />
      </div>
      <div className='h-full overflow-hidden'>
        <div className='md:h-1/2 h-full md:w-full w-1/2'>
          <PieGraph
            title='Spending by Category'
            height='100%'
            accounts={state_accounts}
            thumbnail={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Transactions;