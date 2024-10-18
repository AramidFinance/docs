import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Cross-Chain Compatibility',
    description: (
      <>
        Supports multiple blockchain ecosystems, including Ethereum, Voi Network, Algorand, Arbitrum, Base, and other EVM and AVM compatible chains.
      </>
    ),
  },
  {
    title: 'Decentralized Validation',
    description: (
      <>
        Transactions are validated by a decentralized network of independent validators called Soldiers.
      </>
    ),
  },
  {
    title: 'Security-First Design',
    description: (
      <>
        Employs robust cryptographic techniques and decentralized governance to ensure the safety of user assets.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
