![Cover](/Cover.png)

# 💎 UNI 4 Diamond Hands

A UNI-powered platform to create quizzes that turn your project's coin holders into diamond-handed supporters.

## 🛠️ How it works

### 🎮 Creating a quiz

1. **Connect & Configure**: Developers connect their Sui wallet and fill out a form with project details (website links, coin address), quiz parameters (minimum coin requirement), and rewards (UNI coins for passing and for holding 30+ days).
2. **Deploy & Mint**: After approving a transaction to transfer UNI coins to the Quiz module, the app uploads metadata to IPFS and mints a Quiz NFT.
3. **Track & Promote**: Developers receive a shareable quiz link and can monitor participation, rewards distribution, and holder loyalty through a dashboard. The link can be used in swap interfaces or during bearish sentiment to encourage holding.

### 🧩 Passing a quiz

1. **Connect & Verify**: Users connect their Sui wallet, which verifies they hold the minimum required project coins and haven't received rewards before.
2. **Learn & Answer**: The app generates a unique quiz using AI and scraped project data, designed to highlight the project's potential and encourage holding.
3. **Earn & Hold**: Successful quiz takers receive immediate UNI rewards and are incentivized with additional UNI rewards if they hold their project coins for 30 days.

### 🚰 Getting test tokens

- Users can mint UNI and NAVX test tokens via dedicated faucet pages on the platform for testing purposes.

### ⏱️ Loyalty rewards

- After 30 days, the app automatically identifies eligible users who've maintained their holdings, verifies they haven't received extra rewards yet, and distributes additional UNI coins through the Quiz module.

## 🔗 Artifacts

- Application - [uni-4-diamond-hands.vercel.app](https://uni-4-diamond-hands.vercel.app/)
- Demo quiz - [uni-4-diamond-hands.vercel.app/quizzes/0x389092bbf5dbcaa667617b8ae613dff6ce37f0672a30908b5e66ae24606d3d5c](https://uni-4-diamond-hands.vercel.app/quizzes/0x389092bbf5dbcaa667617b8ae613dff6ce37f0672a30908b5e66ae24606d3d5c)
- UNI faucet - [uni-4-diamond-hands.vercel.app/faucets/uni](https://uni-4-diamond-hands.vercel.app/faucets/uni)
- NAVX faucet - [uni-4-diamond-hands.vercel.app/faucets/navx](https://uni-4-diamond-hands.vercel.app/faucets/navx)
- Package (Sui Testnet) - [0x28d91e48b77943014a5ec4c4f29c9a7945548b996549052c59d0bbbf3bbac737](https://testnet.suivision.xyz/package/0x28d91e48b77943014a5ec4c4f29c9a7945548b996549052c59d0bbbf3bbac737)

## 🛠️ Technologies

- Sui Testnet is used as the blockchain layer for deploying move packages that mint quizzes and distribute rewards.
- Sui dApp Kit is used to connect the application with the Sui network and handle wallet interactions.
- Pinata is used as an IPFS provider to store and retrieve quiz metadata.
- Gemini is used to generate unique, project-specific quiz questions using AI.
- ScraperAPI is used to extract data from project links to generate quizzes.

## 🏗️ Architecture

![Architecture](/Architecture.png)
