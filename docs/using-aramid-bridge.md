---
sidebar_position: 3
---

# Using the Aramid Bridge

The Aramid Bridge enables seamless and secure asset transfers between supported networks. This guide will walk you through the process step-by-step.

### Before You Begin

Ensure you have the following ready:
* A compatible wallet (e.g., [Kibisis](https://kibis.is/), [Rabby](https://rabby.io/)).
* Sufficient native tokens in your origin wallet to pay for gas fees (e.g., VOI, ETH, ALGO).
* The [Supported Assets](https://docs.aramid.finance/docs/supported-networks-and-assets) you wish to bridge in your origin wallet.

## Bridging Your Assets: Step-by-Step

---

**Step 1: Navigate to the Aramid Bridge**

Open your web browser and go to the official Aramid Bridge application: [https://app.aramid.finance](https://app.aramid.finance).

**Step 2: Connect Your Origin Wallet**

First, connect the wallet that holds the assets you want to send.

* Click the **"Connect Wallet"** button.
* Choose your wallet provider from the list.
* Approve the connection request within your wallet extension or application.

![Select your wallet provider](https://github.com/user-attachments/assets/6e96489f-775d-48f5-a8b0-a552ca919d71)
![Confirm your wallet provider](https://github.com/user-attachments/assets/5ff1e5f9-b838-4d5a-9cfd-0d4a636e8208)


**Step 3: Select Your Origin Network and Asset**

* **Origin Chain**: Choose the network you are sending assets *from*.
* **Bridge Asset**: Select the specific token you wish to transfer.

![Select Origin Chain and Bridge Asset](https://github.com/user-attachments/assets/4fd4d4d7-3fab-4ed1-8ab9-6a2304990c69)

**Step 4: Define the Destination**

* **Destination Chain**: Choose the network you are sending assets *to*.
* **Receive Asset**: The asset you will receive will be automatically selected. Verify it is correct.

**Step 5: Set the Recipient Address**

This is the address that will receive the assets.

* **For EVM Destinations** (e.g., Base, Arbitrum): Connect your destination wallet. A connected wallet is **required** to sign the final claim transaction.
* **For AVM Destinations** (e.g., Voi, Algorand): You can either connect your destination wallet or paste the recipient's wallet address directly.

![Configure destination chain and wallet](https://github.com/user-attachments/assets/1f61bd1f-7f1f-433e-92af-a0300149fd2e)

**Step 6: Enter the Amount and Review**

* **Amount**: Enter the quantity of the asset you want to bridge.
* **Note/Memo (Optional)**: You can add a note for your personal records. This is recorded on-chain.
* Click **"Review your transaction"** to proceed.

* **Note on AVM**: You MAY be prompted to sign a separate ASA optin transaction if it's your first time. Aramid scans the destination address before moving to the next stage and will warn you to optin.

![Final transaction confirmation screen](https://github.com/user-attachments/assets/3dafa939-8087-4235-ae6e-20419fbe7e2e)



**Step 7: Final Confirmation and Signing**

Carefully review all transaction details on the confirmation screen: the assets, amounts, and addresses.

![Review transaction details](https://github.com/user-attachments/assets/2e21dd62-8878-4dd1-9306-b4e5e033e849)


To verify the bridge contract addresses, you can check them here:
* **EVM Bridge Address**: `0xC7FAA8f8C6D9Dc05ABf3C5aa741a38F9A6d1C263`
* **AVM Bridge Address**: `ARAMIDFJYV2TOFB5MRNZJIXBSAVZCVAUDAPFGKR5PNX4MTILGAZABBTXQQ`

Click **"Sign"** (for AVM) or **"Approve & Sign"** (for EVM) and authorize the transaction(s) in your origin wallet.

* **Note on EVM**: You may need to sign two separate transactions: one to `Approve` the contract to spend your asset, and a second to `Sign` the bridging transaction itself.

![Confirm transaction](https://github.com/user-attachments/assets/2ca1b91d-8828-4d39-b511-a6d001fa1f31)
![Approve spending transaction in wallet](https://github.com/user-attachments/assets/de98d089-9797-478e-9a32-72fb7e9c0a09)
![Sign spending transaction in wallet](https://github.com/user-attachments/assets/9327c5c3-b577-4cca-9602-e852d5dd1e67)



**Step 8: Awaiting Bridge Confirmation**

The bridge is now processing your transfer. This typically takes under 3 minutes, but can vary based on network congestion.

![Bridging in progress screen](https://github.com/user-attachments/assets/3181843b-1e46-40bd-be0f-564e55a37c50)

**Step 9: Claim Your Assets (EVM Destinations Only)**

* **If your destination is an AVM chain (like Voi), you are done!** The assets will arrive automatically.
* **If your destination is an EVM chain (like Base), you must complete one final step.** Click **"Claim"** and sign the transaction in your **destination wallet** to receive your assets.

**Step 10: Transaction Complete!**

Congratulations, you have successfully used the Aramid Bridge!

You can click **"Bridge again"** to start a new transaction.

![Successful bridge completion screen](https://github.com/user-attachments/assets/e4b02452-9542-437b-ac0a-9eba6d282e56)

## Important Information

* **Gas Fees**: Bridging involves transactions on both the origin and destination networks, each requiring a gas fee paid in the network's native token.
* **Supported Assets**: Before bridging, always confirm your asset is supported by visiting the official [Supported Assets List](https://docs.aramid.finance/docs/supported-networks-and-assets). Using trusted sources prevents sending assets to the wrong contract.
* **Network Congestion**: During periods of high network traffic, transactions may take longer than usual to confirm.
* **Minimums**: Be aware of any minimum transfer amounts that may be in place.

## Troubleshooting & Support

If you encounter any issues or have questions, please visit our official [Support Page](/docs/support) or join our [Discord Community](https://discord.com/your-invite-link) for live assistance and support tickets.
