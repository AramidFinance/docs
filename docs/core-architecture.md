---
sidebar_position: 4
---

# Core Architecture

## Soldier Nodes (Validators)

Soldier Nodes are the decentralized validators that power the Aramid Bridge. They ensure the integrity and security of cross-chain transactions by performing the following tasks:

- Monitoring lock transactions on the source chain.
- Validating signatures from other Soldiers.
- Submitting release transactions to the destination chain once consensus is achieved.

Each Soldier Node operates autonomously and communicates via a peer-to-peer (P2P) protocol, ensuring that no single node has control over the validation process. This decentralized approach improves fault tolerance and mitigates the risk of single points of failure.

## Multi-Signature Consensus Mechanism

A key security feature of Aramid is its multi-signature (multisig) mechanism. A transaction can only be executed if a predefined threshold of Soldier Nodes sign off on it. This ensures that:

- No single node can unilaterally approve or process a transaction.
- N-out-of-M multi-signature validation is enforced, where a majority or supermajority of signatures is required for critical operations (e.g., transferring tokens, governance updates).

## Cryptographic Security

Aramid employs advanced cryptographic techniques to secure all cross-chain transactions. This includes:

- Elliptic Curve Digital Signature Algorithm (ECDSA) for tamper-proof cryptographic signatures.
- SHA-256 Hashing for secure, irreversible hashing of transaction data.
- Threshold Signatures to ensure only valid, verified transactions are processed by the system.
