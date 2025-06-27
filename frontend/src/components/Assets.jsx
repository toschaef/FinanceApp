import { useContext } from "react";
import Context from '../Context';
import formatCurrency from '../util/formatCurrency';
import axios from 'axios';
import NavBar from "./NavBar";
import AssetButton from "./AssetButton";

const Assets = () => {
  const { email, state_assets, refreshProduct } = useContext(Context);

  const deleteAsset = async (id) => {
    try {
      await axios.delete('/api/assets', {
        params: { email, id }
      });
      await refreshProduct('assets', email);
    } catch (err) {
      console.error('Error deleting asset', err);
    }
  }

  return (<>
    <NavBar />
    <h1>Assets</h1>
    {Object.keys(state_assets).length === 0 ? (<>
      <p>No assets found</p>
      <AssetButton text="Add One" />
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
      <AssetButton text="Add Asset" />
    </>)}
  </>);
};

export default Assets;
