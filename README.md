# Etta: A reference open-source non-custodial lightning wallet

- Built with React Native for Android & iOS.
- Written in Typescript
- Fully customizable with designed components
- Built with accessibility in mind ♿️
- Built-in localization 💬
- Open source 😸

![License](https://img.shields.io/badge/license-MIT-232323.svg?style=flat-square)
[![Discord](https://img.shields.io/badge/Discord-Join%20the%20chat-5965f2.svg?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/mg8f26C)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-00acee.svg?style=flat-square&logo=twitter&logoColor=white)](https://twitter.com/EttaWallet)
[![Sponsor](https://img.shields.io/badge/GitHub-Code-232323.svg?style=flat-square&logo=github&logoColor=white)](https://github.com/EttaWallet/EttaWallet)

Etta Wallet will be a resource for experimenting with non-custodial lightning with a strong bias towards usability, accessibility and good UX.

The project is strongly inspired by [Bitcoin Design Community's daily spending wallet](https://bitcoin.design/guide/daily-spending-wallet/) and will continue to evolve with their sound suggestions.

## Features

- [x] Bitcoin only wallet
- [x] Non-custodial
- [x] Lightning via LDK and Electrum
- [x] Supports multiple languages and locales
- [x] Accessibility baked-in (Haptic feedback, screen reader support)
- [x] Biometrics security: Fingerprint, Touch ID, FaceID
- [x] Scan QR codes
- [x] Just-In-Time liquidity with zero-conf channels
- [x] Open new channels
- [x] Automated channel creation via LSP
- [x] Local backups
- [ ] Cloud backups
- [ ] Connect over TOR
- [ ] LNURL support
- [ ] Contacts (For BOLT 12 offers, Lightning addresses, etc)
- [ ] Toggle dark mode

## Current Limitations

- Ships in testnet for now
- Translations are outdated. 
- Accessibility features are outdated for most components.

## Reproducible Build (**Don't trust, verify**)

Start by [forking the repo](https://github.com/EttaWallet/EttaWallet/fork) from GitHub, clone it locally and install dependencies.

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/EttaWallet
cd EttaWallet
yarn install
```

### Developing

Once you've cloned the repo, installed dependencies, run the following command.

```bash
yarn start
```

#### Android

1. Using a physical android phone? Enable Developer mode and USB Debugging, and confirm it is connected by running `adb devices`. If you want to use an Android simulator, this step isn't necessary
2. Open a new tab in your terminal and run `yarn android`

### iOS

1. Open a new tab in your terminal
2. `cd ios && pod install`. For M1, you might have to do `arch -x86_64 pod install`
3. `cd .. && yarn ios`.

## Contributing

EttaWallet is an open-source project so anybody can use and contribute to it. You also don't necessarily need to know how to code. Some meaningful contributions include:

- Sharing ideas and suggestions
- Improving documentation
- Sharing well-written bug reports
- Improving the translation scope.
- Requesting new features.

You can start in the [discussion forum here](https://github.com/orgs/EttaWallet/discussions).

If you would like to contribute code, here a few guidelines:

- It would be helpful to create an issue first before submitting a PR just to make sure nobody isn't working on the same yet or it just wouldn't be a good fit.
- Even if your changes are obvious, your PR should define what you are changing. Nothing is too obvious. 
- PRs should be opened against the `next` branch.

### Branches

`current` - The latest release

`next` - The branch to submit pull requests against. It mirrors what's coming in the next release

## License

EttaWallet is 100% open-source and available under the MIT license.

## Attribution

Special thanks to the following open-source projects that help make EttaWallet possible.

- All design tokens and primitives are inspired by [Bitcoin Design Guide](https://bicoin.design/)'s daily spending wallet
- Icons are courtesy of [Bitcoin Icons](https://bitcoinicons.com)
- Non-custodial lightning is courtesy of [Lightning Dev Kit(LDK)](https://lightningdevkit.org) and made possible through Synonym's [react-native-ldk](https://github.com/synonymdev/react-native-ldk)
  