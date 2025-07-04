import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    "intro",
    "supported-networks-and-assets",
    "using-aramid-bridge",
    "arbitrage",
    "core-architecture",
    "cross-chain-messaging",
    "governance-and-upgradability",
    "security-features",
    "fee-structure",
    "security-audits",
    "support",
    "voi-metrics-report-2024-09-to-2025-05",
    {
      type: "category",
      label: "Node Operators",
      items: [
        "node-operators/aramid-soldier-setup",
        "node-operators/revert-failed-transactions",
      ],
    },
  ],
};

export default sidebars;
