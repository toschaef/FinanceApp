import TransactionsPortal from './TransactionsPortal';

const Transactions = () => {
  return (
    <div className='flex flex-col md:flex-row h-full w-full'>
      <div className='w-full md:w-1/2 md:h-full sm:h-1/2 h-[400px] sm:min-h-[500px] m-1'>
        <TransactionsPortal />
      </div>
    </div>
  );
};

export default Transactions;