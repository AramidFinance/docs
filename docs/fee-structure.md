---
sidebar_position: 8
---

# Fee Structure

## Aramid Fee

Aramid employs a 0.1% fee model for all bridging transactions as a baseline, ensuring transparency and predictability for users, regardless of network conditions or transaction size. Every network additionally enforces a hard minimum fee floor of ~0.0999% (dividing the transferred amount by 1.001), and specific asset routes may configure a higher minimum via a percentage and/or constant fee component. All bridge amount calculations round down (truncate), never up. See the [AI Agent / MCP Integration guide](/docs/developers/ai-agent-integration) for the exact formulas used by the soldier nodes to validate fees and rounding.

## Gas Fees

In addition to the fixed fee, users must also pay network gas fees to cover the cost of executing the transaction on the specific blockchain. These gas fees are determined by the underlying blockchain network (e.g., Ethereum) and can fluctuate based on:

- Network congestion
- Transaction complexity
