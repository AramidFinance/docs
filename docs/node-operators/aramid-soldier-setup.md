---
sidebar_position: 1
---

# Aramid Soldier Setup

Aramid Bridge is a multisignature, multichain bridge supporting EVM, AVM, and NEAR. An Aramid Soldier plays a key role in ensuring the security and operation of the bridge by acting as a signatory of the multisig.

## Components

Each soldier must run the following components:

- Aramid Chain Relay Algod and Indexer Nodes
- A Public Participation Node
- Aramid Soldier App

If you are interested in becoming an Aramid Soldier, fill out the registration form.

## Environment

Aramid apps are best run in Kubernetes environments. The following sections provide detailed steps for setting up each component.

## Kubernetes Setup

Kubernetes is an open-source container orchestration platform designed to automate the deployment, scaling, and management of containerized applications.

### Key Features

- Container Orchestration: Automates the deployment and scaling of containerized applications across clusters.
- Self-healing: Automatically restarts containers that fail, replaces containers, and manages health checks.
- Horizontal Scaling: Applications can be scaled up and down with a simple command or automatically based on CPU usage.
- Service Discovery and Load Balancing: Kubernetes can expose containers using DNS names or their own IP addresses.
- Automated Rollouts and Rollbacks: Kubernetes progressively rolls out changes while monitoring the application's health.
- Secret and Configuration Management: Store and manage sensitive information like passwords, tokens, and SSH keys.

Kubernetes is widely used in production environments to manage microservices and ensure high availability of applications.

### Linode Kubernetes Setup

To set up Kubernetes on Linode, follow the steps outlined in the [Linode K8S setup guide](https://www.linode.com/docs/guides/how-to-deploy-kubernetes-on-linode-with-linode-kubernetes-engine-lke/).

## Helm Repository Setup

Helm is a package manager for Kubernetes that simplifies the process of deploying and managing applications.

### Benefits

- Simplified Deployment: Helm charts bundle necessary Kubernetes manifests.
- Version Control: Easily manage versions and rollbacks of deployments.
- Reusability: Helm charts can be shared across projects.
- Customization: Helm provides a templating engine for easy customization.
- Dependency Management: Helm manages dependencies between charts, simplifying complex setups.

### Installation

To install Helm, run the following command:

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

For more details, refer to the Helm repository setup guide.

## Algod Node Setup

Aramid chain relay nodes are used for bootstrapping AVM chains. Soldiers use the algod node in their Aramid Soldier app to submit payloads and exchange data.

### Relay Node Setup

To set up the relay node, follow these steps:

1. Create the `aramid-relay-values.yaml` file and add any necessary modifications from the default `values.yaml` configuration. You can review the default configuration here.

Example configuration for Linode:

```yaml
pvcRoot:
  storageClassName: "linode-block-storage-retain"

deployment:
  resources:
    requests:
      memory: '1000Mi'
      cpu: '1000m'
    limits:
      memory: '16000Mi'
      cpu: '8000m'
```

Example for AWS:

```yaml
pvcRoot:
  storageClassName: "gp2"
```

2. Review the configuration:

```bash
helm template biatec-repo/aramid-relay --values ./aramid-relay-values.yaml --namespace aramid
```

3. Install the node:

```bash
kubectl create namespace aramid
helm install aramid-relay biatec-repo/aramid-relay --values ./aramid-relay-values.yaml --namespace aramid
```

4. Update or upgrade the node:

```bash
helm upgrade aramid-relay biatec-repo/aramid-relay --values ./aramid-relay-values.yaml --namespace aramid
```

For more details, visit:

- Relay node setup using helm chart
- Example node setup on GitHub: Aramid Relay Node Setup

## Indexer Node Setup

The Aramid Indexer Node serves lookup functions for the Aramid Soldier app.

### Indexer Node Installation

1. Create the `aramid-indexer-values.yaml` file with modifications as needed from the default configuration. See the default `values.yaml` here.

Example configuration for Linode:

```yaml
pvcDB:
  storageClassName: "linode-block-storage-retain"
  resources:
    requests:
      storage: 50Gi

pvcConduit:
  storageClassName: "linode-block-storage-retain"

pvcFollowNode:
  storageClassName: "linode-block-storage-retain"

ingress:
  host: "aramidmain-indexer.us.biatec.io"
```

Example for AWS:

```yaml
pvcDB:
  storageClassName: "gp2"
  resources:
    requests:
      storage: 50Gi

pvcConduit:
  storageClassName: "gp2"

pvcFollowNode:
  storageClassName: "gp2"

ingress:
  host: "aramidmain-indexer.us.biatec.io"
```

2. Review the configuration:

```bash
helm template biatec-repo/aramid-indexer --values ./aramid-indexer-values.yaml --namespace aramid
```

3. Install the node:

```bash
kubectl create namespace aramid
helm install aramid-indexer biatec-repo/aramid-indexer --values ./aramid-indexer-values.yaml --namespace aramid
```

4. Update the node:

```bash
helm upgrade aramid-indexer biatec-repo/aramid-indexer --values ./aramid-indexer-values.yaml --namespace aramid
```

5. Check the node's status:

```bash
kubectl get pods,services,ingresses -n aramid
```

For more information, refer to:

- Indexer setup using helm chart
- Example setup on GitHub: Aramid Indexer Setup

## Public Participation Node Setup

The Public Participation Node allows anyone to make their account online and protect the AramidMain chain.

### Participation Node Installation

1. Create the `aramid-participation-values.yaml` file with modifications from the default configuration. See the default `values.yaml` here.

Example configuration for Linode:

```yaml
pvcParticipationNode:
  storageClassName: "linode-block-storage-retain"

ingressParticipationNode:
  host: "aramidmain-participation.us.biatec.io"
```

Example for AWS:

```yaml
pvcParticipationNode:
  storageClassName: "gp2"

ingressParticipationNode:
  host: "aramidmain-participation.us.biatec.us"
```

2. Review the configuration:

```bash
helm template biatec-repo/aramid-participation --values ./aramid-participation-values.yaml --namespace aramid
```

3. Install the node:

```bash
kubectl create namespace aramid
helm install aramid-participation biatec-repo/aramid-participation --values ./aramid-participation-values.yaml --namespace aramid
```

4. Update the node:

```bash
helm upgrade aramid-participation biatec-repo/aramid-participation --values ./aramid-participation-values.yaml --namespace aramid
```

5. Check node status:

```bash
kubectl get pods,services,ingresses -n aramid
```

Public participation nodes are registered in this GitHub repository: Public Participation Providers
