import { useContext } from 'react';
import Context from '../../Context';
import formatCurrency from '../../util/formatCurrency';
import axios from 'axios';
// import AssetButton from './AssetsForm';

const Assets = () => {
  const { email, state_assets, user_token, refreshProduct } = useContext(Context);

  const deleteAsset = async (id) => {
    try {
      await axios.delete('/api/assets', {
        params: { email, id, user_token }
      });
      await refreshProduct('assets', email, user_token);
    } catch (err) {
      console.error('Error deleting asset', err);
    }
  }

  return (<>
    <h1>Assets</h1>
    {Object.keys(state_assets).length === 0 ? (<>
      <p>No assets found</p>
      <AssetButton text='Add One' />
    </>) : (<>
      {state_assets
        .sort((a, b) => a.asset_name.localeCompare(b.asset_name))
        .map((ast, index) => (
          <li key={index}>
            {ast.asset_name} - {formatCurrency(Math.abs(ast.estimated_value), ast.iso_currency_code)}
            <button onClick={() => deleteAsset(ast.id)}>Delete</button>
            <br />
            {ast.bio}
          </li>
      ))}
      {/* <AssetButton text='Add Asset' /> */}
    </>)}
  </>);
};

export default Assets;
