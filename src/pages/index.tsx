import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const TableOfContents = [
  { title: 'Introduction', link: '/docs/intro', description: 'Get started with Aramid Finance' },
  { title: 'Supported Networks and Assets', link: '/docs/supported-networks-and-assets', description: 'Explore the networks and assets supported by Aramid' },
  { title: 'Using Aramid Bridge', link: '/docs/using-aramid-bridge', description: 'Learn how to use the Aramid Bridge' },
  { title: 'Core Architecture', link: '/docs/core-architecture', description: 'Understand the core architecture of Aramid' },
  { title: 'Cross-Chain Messaging', link: '/docs/cross-chain-messaging', description: 'Discover Aramid\'s cross-chain messaging capabilities' },
  { title: 'Governance and Upgradability', link: '/docs/governance-and-upgradability', description: 'Learn about Aramid\'s governance model and upgradability' },
  { title: 'Security Features', link: '/docs/security-features', description: 'Explore the security features of Aramid' },
  { title: 'Fee Structure', link: '/docs/fee-structure', description: 'Understand Aramid\'s fee structure' },
  { title: 'Security Audits', link: '/docs/security-audits', description: 'View Aramid\'s security audit reports' },
  { title: 'Support', link: '/docs/support', description: 'Get support for Aramid Finance' },
  { title: 'Node Operators', link: '/docs/node-operators/aramid-soldier-setup', description: 'Technical guide for setting up and running Aramid Soldier nodes' },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <img 
          src="/img/logo-2.png" 
          alt="Aramid Finance Logo" 
          className={styles.heroLogo}
        />
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

function TableOfContentsSection() {
  return (
    <section className={styles.tableOfContents}>
      <div className="container">
        <h2 className={styles.tocTitle}>Documentation</h2>
        <div className={styles.tocGrid}>
          {TableOfContents.map((item, index) => (
            <Link to={item.link} key={index} className={styles.tocCard}>
              <h3 className={styles.tocCardTitle}>{item.title}</h3>
              <p className={styles.tocCardDescription}>{item.description}</p>
              {item.title.includes('Node Operators') && (
                <span className={styles.techBadge}>Technical</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="Aramid Finance Documentation - Secure and Efficient Cross-Chain Protocol">
      <HomepageHeader />
      <main>
        <TableOfContentsSection />
      </main>
    </Layout>
  );
}
