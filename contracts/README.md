# Contracts

### Commands

- Run WSL - `wsl`
- Build project - `sui move build`
- Run tests - `sui move test`
- Publish package - `sui client publish`
- Read object values - `sui client object 0x5bfc2ed0dbd51172c6041706564b1b6c1bfc0abb4a7902f9d8cc1d32b9e750e8`

### Extra commands

**Mint UNI:**

```bash
sui client call \
--package 0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54 \
--module uni \
--function mint \
--args 0x79f6cc83d50c34bd4b49b8ea57092b9fd719a22c0f517a2ee84b6c3766db1470 1000000000 0x90bbf7799fe30efda0e7c1a9f7bdc05a8e8ecfac69f4d4445f34ef26269e7baa
```

**Split UNI coins:**

```bash
sui client split-coin --coin-id 0x5e6b944fb0a9c2ce77c0d1692678b80279314646c80106327839aa4b8f93cc63 --amounts 10000000
```

**Mint quiz:**

```bash
sui client call \
--package 0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54 \
--module quiz \
--function mint_to_sender \
--args "Quiz 1" "Quiz 1 Description" "ipfs://quiz_1" 0xc7114d53bd596f8795040221c9f9ba629a164d75bd901b194e723d6f2ef23653 1000000 \
--type-args 0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54::uni::UNI
```

**Pass quiz:**

```bash
sui client call \
--package 0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54 \
--module quiz \
--function pass \
--args 0x7e72569f6d877c7e20b7c1eb913bca098c28370941c51ff384128da2d6fd06ea 0xd0c8b608b55422117267cc6e3616803dcf7ab33488a89e5433ddd7f77b5180df  \
--type-args 0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54::uni::UNI
```
