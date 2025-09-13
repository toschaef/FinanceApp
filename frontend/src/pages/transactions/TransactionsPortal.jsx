import { useContext, useState, useMemo } from 'react';
import axios from 'axios';
import Modal from '../../components/Modal';
import TransactionsForm from './TransactionsForm';
import Context from '../../Context';

const TransactionsPortal = () => {
  const { email, state_transactions, user_token, dispatch } = useContext(Context);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);

  const [groupBy, setGroupBy] = useState('none');
  const [sortBy, setSortBy] = useState('date');

  const formatDate = (date) => {
    const year = new Date().getFullYear();
    const datePart = date.split('T')[0];
    if (datePart.startsWith(year)) {
      return datePart.slice(5);
    }
    return datePart;
  };

  const formatAmount = (amount) => {
    amount = Number(amount); 
    return (
      <span className={`${amount > 0 ? 'text-gray-400' : 'text-green-600'}`}>
        {`$${Math.abs(Number(amount)).toFixed(2)}`}
      </span>
  )};

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/transactions`, {
        params: { id, user_token, email },
      });
      dispatch({
        type: 'SET_STATE',
        state: {
          state_transactions: state_transactions.filter((t) => t.id !== id),
        },
      });
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const handleAddTransaction = async () => {
    try {
      await axios.post('/api/transactions', {
        ...formData,
        user_token,
        email 
      });

      dispatch({
        type: 'SET_STATE',
        state: {
          state_transactions: [...state_transactions, data.transaction],
        },
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  const sortTransactions = (a, b) => {
    switch (sortBy) {
      case 'name':
        return a.transaction_name.localeCompare(b.transaction_name);
      case 'amount':
        return b.amount - a.amount;
      case 'date':
      default:
        return new Date(b.transaction_date) - new Date(a.transaction_date);
    }
  };

  const groupedTransactions = useMemo(() => {
    if (groupBy === 'none') {
      return { All: [...state_transactions].sort(sortTransactions) };
    }

    const groups = {};
    state_transactions.forEach((txn) => {
      const key =
        groupBy === 'account'
          ? txn.account_name
          : groupBy === 'bank'
          ? txn.institution_name
          : groupBy === 'category'
          ? txn.finance_category
          : 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(txn);
    });

    Object.keys(groups).forEach((key) => {
      groups[key].sort(sortTransactions);
    });

    return groups;
  }, [state_transactions, groupBy, sortBy]);

  return (
    <div className='flex flex-col w-full h-full bg-white sm:p-6 p-4 border rounded-lg shadow-sm'>
      {/* header */}
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl sm:text-2xl font-semibold text-gray-700 pt-[-2rem]'>
          Transactions
        </h2>
        {/* group by + sort by */}
        <div className='flex flex-wrap gap-4 mb-4'>
          <div>
            <label className='text-sm font-medium text-gray-600 mb-1 block'>
              Group By
            </label>
            <select
              className='border sm:px-2 sm:py-1 px-1 rounded shadow-sm'
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <option value='none'>None</option>
              <option value='account'>Account</option>
              <option value='bank'>Bank</option>
              <option value='category'>Category</option>
            </select>
          </div>
          <div>
            <label className='text-sm font-medium text-gray-600 mb-1 block'>
              Sort By
            </label>
            <select
              className='border sm:px-2 sm:py-1 px-1 rounded shadow-sm'
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value='date'>Date</option>
              <option value='name'>Name</option>
              <option value='amount'>Amount</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className='px-2 sm:px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-base'
        >
          + Add
        </button>
      </div>
      {/* transaction window */}
      <div className='flex-1 overflow-auto bg-white rounded-lg shadow min-h-0'>
        <table className='w-full text-left border-collapse'>
          <thead className='bg-gray-200 text-gray-600 sticky top-0 z-20'>
            <tr className='text-xs sm:text-sm'>
              <th className='py-3 px-2 sm:px-3 font-semibold'>Name</th>
              <th className='py-3 px-2 sm:px-3 font-semibold'>Amount</th>
              <th className='py-3 px-2 sm:px-3 font-semibold hidden sm:table-cell'>Category</th>
              <th className='py-3 px-2 sm:px-3 font-semibold'>Date</th>
              {/* hidden on sm */}
              <th className='py-3 px-2 sm:px-3 font-semibold hidden md:table-cell'>Account</th>
              <th className='py-3 px-2 sm:px-3 font-semibold hidden md:table-cell'>Bank</th>
              <th className='py-3 px-2 sm:px-3 font-semibold'></th>
            </tr>
          </thead>
          {Object.entries(groupedTransactions).map(([group, txns]) => (
            <tbody key={group}>
              {groupBy !== 'none' && (
              <tr className="sticky top-[42px] border-y-1 border-gray-400 z-10 bg-gray-100">
                <td
                  colSpan={7}
                  className="px-3 py-1 font-medium text-xs text-gray-600"
                >
                  {group}
                </td>
              </tr>
              )}
              {txns.map((txn) => (
                <tr key={txn.id} className='border-b hover:bg-gray-50 text-xs sm:text-sm text-gray-700'>
                  <td className='py-2 px-2 sm:px-3' title={txn.transaction_name}>
                      <div className='truncate'>{txn.transaction_name}</div>
                  </td>
                  <td className='py-2 px-2 sm:px-3 whitespace-nowrap'>
                    {formatAmount(txn.amount)}
                  </td>
                  <td className='py-2 px-2 sm:px-3 hidden sm:table-cell' title={txn.finance_category}>
                     <div className='truncate'>{txn.finance_category}</div>
                  </td>
                  <td className='py-2 px-2 sm:px-3 whitespace-nowrap'>
                    {formatDate(txn.transaction_date)}
                  </td>
                   {/* hidden unless md */}
                  <td className='py-2 px-2 sm:px-3 whitespace-nowrap hidden md:table-cell'>
                    {txn.mask}
                  </td>
                  <td className='py-2 px-2 sm:px-3 hidden md:table-cell' title={txn.institution_name}>
                    <div className='truncate'>{txn.institution_name}</div>
                  </td>
                  <td className='py-2 px-2 sm:px-3 text-right'>
                    <button
                      onClick={() => handleDelete(txn.id)}
                      className='w-6 my-1 sm:w-7 h-6 sm:h-7 flex items-center justify-center rounded-full bg-gray-100 text-red-600 hover:bg-red-600 hover:text-white transition ease-in-out'
                    >
                      <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='currentColor' viewBox='0 0 16 16'>
                        <path d='M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z' />
                        <path d='M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z' />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {txns.length === 0 && (
                <tr>
                  <td colSpan='7' className='p-4 text-center text-gray-500'>
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          ))}
        </table>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='Add Transaction'
        onSubmit={handleAddTransaction}
        onChange={setFormData}
      >
        <TransactionsForm onChange={setFormData} />
      </Modal>
    </div>
  );
};

export default TransactionsPortal;