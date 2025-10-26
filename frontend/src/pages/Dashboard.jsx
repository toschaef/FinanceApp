import { useContext } from 'react';
import LinkButton from '../components/LinkButton';
import Context from '../Context';
import AreaGraph from '../components/AreaGraph';
import HeatMap from '../components/HeatMap';
import InflowOutflow from '../components/InflowOutflow';

const PlaceholderCard = ({ title, subtitle, datatype }) => (
  <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-center items-center min-h-[150px]">
    <div className="text-sm text-gray-500">{title}</div>
    {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    <div className="mt-3 text-gray-400 text-sm">No {datatype} data available</div>
  </div>
);

const Dashboard = () => {
  const {
    hasItem,
    state_transactions,
    state_investments,
    state_accounts,
    state_assets,
  } = useContext(Context);

  const userHasNothing = () =>
    !hasItem && state_transactions.length === 0 && state_assets.length === 0;

  const userHasTransactions = () => Boolean(state_transactions.length);
  const userHasInvestment = () => Boolean(state_investments.length);

  const accountsWithInvestments = () => {
    const ids = new Set(state_investments.map((i) => i.account_id));
    return state_accounts.filter((acc) => ids.has(acc.account_id));
  };

  const hasLocationData = () => state_transactions.some((t) => t.lat && t.lng);

  return (
    <div className="flex-1 w-full h-full p-4">
      {userHasNothing() ? (
        <div className="flex justify-center items-center h-full">
          <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-[600px]">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              No data yet. <br /> Link a Bank to begin syncing activity.
            </h2>
            <LinkButton text="Link Bank" />
          </div>
        </div>
      ) : (
        <div
          className="
            grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2
            xl:grid-cols-2 2xl:grid-cols-2
            sm:grid-rows-2
            gap-4
            w-full h-full
            p-0
          "
        >
          {/* balance graph */}
          {userHasTransactions() ? (
            <div className="bg-white rounded-xl shadow-md w-full h-full sm:p-4 p-2 z-50">
              <AreaGraph
                title="Accounts Overview"
                subtitle="Total Balance"
                width="100%"
                accounts={state_accounts}
                investments={state_investments}
                transactions={state_transactions}
                assets={[]}
                thumbnail={false}
                timespan="x"
              />
            </div>
          ) : (
            <PlaceholderCard
              title="Accounts Overview"
              subtitle="Total Balance"
              datatype="balance"
            />
          )}

          {/* investments graph */}
          {userHasInvestment() ? (
            <div className="bg-white rounded-xl shadow-md w-full h-full sm:p-4 p-2 z-50">
              <AreaGraph
                title="Investment Overview"
                subtitle="Investment Balance"
                width="100%"
                accounts={accountsWithInvestments()}
                investments={state_investments}
                transactions={[]}
                assets={[]}
                thumbnail={false}
                timespan="x"
              />
            </div>
          ) : (
            <PlaceholderCard
              title="Investment Overview"
              subtitle="Investment Balance"
              datatype="investment"
            />
          )}

          {/* heatmap */}
          {hasLocationData() ? (
            <div className="bg-white rounded-xl shadow-md w-full h-full flex flex-col sm:p-4 p-2">
              <h3 className="text-md sm:text-lg font-semibold text-gray-700 px-4 py-4">
                Transaction Map
              </h3>
              <div className="rounded-xl overflow-hidden flex-1">
                <HeatMap />
              </div>
            </div>
          ) : (
            <PlaceholderCard
              title="Transaction Map"
              subtitle="Geolocation Overview"
              datatype="location"
            />
          )}

          {/* inflow/outflow */}
          {userHasTransactions() ? (
            <div className="w-full h-full">
              <InflowOutflow user_transactions={state_transactions} />
            </div>
          ) : (
            <PlaceholderCard
              title="Inflow vs Outflow"
              subtitle="Cash Movement"
              datatype="transaction"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;