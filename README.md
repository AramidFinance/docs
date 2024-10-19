# Aramid Finance Documentation

This repository contains the documentation for Aramid Finance, a decentralized, high-performance cross-chain protocol designed to facilitate secure and efficient token bridging and messaging across multiple blockchain ecosystems.

## About Aramid Finance

Aramid Finance provides seamless interoperability between AVM (Algorand Virtual Machine) and EVM (Ethereum Virtual Machine) compatible networks, with a strong emphasis on decentralization, security, and scalability. It is maintained by the Aramid Collective, a non-profit organization, and governed by the Aramid DAO.

## Documentation Website

This documentation is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
