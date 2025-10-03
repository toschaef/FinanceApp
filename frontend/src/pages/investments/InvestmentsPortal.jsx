import { useContext, useState, useMemo, Fragment } from 'react';
import axios from 'axios';
import Modal from '../../components/Modal';
import InvestmentsForm from './InvestmentsForm';
import Context from '../../Context';

const InvestmentsPortal = () => {
  const { email, state_investments, user_token, dispatch } = useContext(Context);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);

  const [groupBy, setGroupBy] = useState('none');
  const [sortBy, setSortBy] = useState('date');

  const formatCurrency = (value) => {
    const amount = Number(value);
    return (
      <span className={amount < 0 ? 'text-red-600' : 'text-gray-700'}>
        {`$${amount.toFixed(2)}`}
      </span>
    );
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/investments/transactions`, {
        params: { id, user_token, email },
      });
      dispatch({
        type: 'SET_STATE',
        state: {
          state_investments: state_investments.map(inv => ({
            ...inv,
            transactions: inv.transactions.filter(t => t.id !== id),
          })),
        },
      });
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const handleAddTransaction = async () => {
    try {
      const { data } = await axios.post('/api/investments/transactions', {
        ...formData,
        user_token,
        email,
      });

      dispatch({
        type: 'SET_STATE',
        state: {
          state_investments: state_investments.map(inv =>
            inv.security_id === data.transaction.security_id
              ? { ...inv, transactions: [...inv.transactions, data.transaction] }
              : inv
          ),
        },
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  const allTransactions = useMemo(() => {
    return state_investments.flatMap(inv =>
      inv.transactions.map(txn => ({
        ...txn,
        investment_name: inv.investment_name,
        ticker_symbol: inv.ticker_symbol,
        account_name: inv.account_name,
        institution_name: inv.institution_name,
        mask: inv.mask,
      }))
    );
  }, [state_investments]);

  const sortTransactions = (a, b) => {
    switch (sortBy) {
      case 'amount':
        return b.amount - a.amount;
      case 'date':
      default:
        return new Date(b.transaction_date) - new Date(a.transaction_date);
    }
  };

const groupedTransactions = useMemo(() => {
  if (groupBy === 'none') {
    return { All: [...allTransactions].sort(sortTransactions) };
  }

  const groups = {};
    allTransactions.forEach((txn) => {
      const key =
        groupBy === 'account'
          ? txn.account_name
          : groupBy === 'bank'
          ? txn.institution_name
          : 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(txn);
    });

    Object.keys(groups).forEach((key) => {
      groups[key].sort(sortTransactions);
    });

    return groups;
  }, [allTransactions, groupBy, sortBy]);


  return (
    <div className='flex flex-col w-full h-full bg-white sm:p-6 p-4 border rounded-lg shadow-sm'>
      {/* header */}
      <div className='flex justify-between items-center mb-4 flex-wrap'>
        <h2 className='text-xl sm:text-2xl font-semibold text-gray-700'>
          Investment Transactions
        </h2>
        {/* sort by + group by */}
        <div className='flex items-center gap-4 flex-wrap'>
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
              <option value='amount'>Amount</option>
            </select>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className='self-end px-2 sm:px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-base'
          >
            + Add
          </button>
        </div>
      </div>

      {/* inv transactions window */}
      <div className='flex-1 overflow-auto bg-white rounded-lg shadow'>
        <table className='w-full text-left border-collapse'>
          <thead className='bg-gray-200 text-gray-600 sticky top-0 z-20'>
            <tr className='text-xs sm:text-sm'>
              <th className='py-3 px-2 sm:px-3 font-semibold'>Date</th>
              <th className='py-3 px-2 sm:px-3 font-semibold'>Type</th>
              <th className='py-3 px-2 sm:px-3 font-semibold'>Security</th>
              <th className='py-3 px-2 sm:px-3 font-semibold'>Quantity</th>
              <th className='py-3 px-2 sm:px-3 font-semibold'>Price</th>
              <th className='py-3 px-2 sm:px-3 font-semibold'>Amount</th>
              <th className='py-3 px-2 sm:px-3 font-semibold hidden md:table-cell'>Account</th>
              <th className='py-3 px-2 sm:px-3 font-semibold hidden md:table-cell'>Bank</th>
              <th className='py-3 px-2 sm:px-3 font-semibold'></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedTransactions).map(([group, txns]) => (
              <Fragment key={group}>
                {groupBy !== 'none' && (
                  <tr className='sticky top-[42px] bg-gray-100 z-10 border-y border-gray-300'>
                    <td colSpan={10} className='px-3 py-1 font-medium text-xs text-gray-600'>
                      {group}
                    </td>
                  </tr>
                )}
                {txns.map((txn) => (
                  <tr
                    key={txn.id}
                    className='border-b hover:bg-gray-50 text-xs sm:text-sm text-gray-700'
                  >
                    <td className='py-2 px-2 sm:px-3'>{formatDate(txn.transaction_date)}</td>
                    <td className='py-2 px-2 sm:px-3'>{txn.type} {txn.subtype && `(${txn.subtype})`}</td>
                    <td className='py-2 px-2 sm:px-3'>{txn.investment_name}</td>
                    <td className='py-2 px-2 sm:px-3'>{txn.quantity}</td>
                    <td className='py-2 px-2 sm:px-3'>{formatCurrency(txn.price)}</td>
                    <td className='py-2 px-2 sm:px-3'>{formatCurrency(txn.amount)}</td>
                    <td className='py-2 px-2 sm:px-3 hidden md:table-cell'>{txn.account_name}</td>
                    <td className='py-2 px-2 sm:px-3 hidden md:table-cell'>{txn.institution_name}</td>
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
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='Add Investment Transaction'
        onSubmit={handleAddTransaction}
        onChange={setFormData}
      >
        <InvestmentsForm onChange={setFormData} />
      </Modal>
    </div>
  );
};

export default InvestmentsPortal;
