import React, { useCallback, useContext, useEffect } from 'react';
import Context from '../Context';
import LinkButton from '../components/LinkButton'
import NavBar from '../components/NavBar';

const ManageBanks = () => {
  const { bankNames } = useContext(Context);

  const handleDelete = (bankName) => {
    console.log(`(not) Deleting Item with name : ${bankName}`);
    // todo
  };

  return (
    <div>
      <NavBar />
      <h1>Manage Your Banks</h1>
      <ul>
        {bankNames.length > 0 ? (
          bankNames.map((name) => (
            <li key={name}>
              <h1>{name}</h1>
              <button onClick={() => handleDelete(name)}>Remove Bank</button>
            </li>
          ))
        ) : (
          <p>No banks linked yet.</p>
        )}
      </ul>
      <LinkButton text={"Add Bank"} />
    </div>
  );
};

export default ManageBanks;
