import React, { useState } from 'react';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import './MyComponentStyles.css'; // Import the CSS file for styling

const MyComponent = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);

    const connectToPolkadot = async () => {
        const extensions = await web3Enable('MyReactApp');
        if (extensions.length === 0) {
            console.error('No extension found');
            return;
        }

        const availableAccounts = await web3Accounts();
        if (availableAccounts.length === 0) {
            console.error('No accounts found');
            return;
        }

        setAccounts(availableAccounts);
        setSelectedAccount(availableAccounts[0]); // Default to the first account
    };

    const handleAccountChange = (event) => {
        const account = accounts.find(acc => acc.address === event.target.value);
        setSelectedAccount(account);
    };

    return (
        <div>
            {accounts.length > 0 ? (
                <div>
                    <select onChange={handleAccountChange}>
                        {accounts.map(acc => (
                            <option key={acc.address} value={acc.address}>
                                {acc.meta.name || acc.address}
                            </option>
                        ))}
                    </select>
                    <button className="buttonStyle">
                        {selectedAccount ? selectedAccount.meta.name || selectedAccount.address : 'Select Account'}
                    </button>
                </div>
            ) : (
                <button onClick={connectToPolkadot} className="buttonStyle">
                    Connect to Polkadot
                </button>
            )}
        </div>
    );
};

export default MyComponent;
