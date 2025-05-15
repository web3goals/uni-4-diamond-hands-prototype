# Contracts

### Commands

- Run WSL - `wsl`
- Build project - `sui move build`
- Run tests - `sui move test`
- Publish package - `sui client publish ./sources/uni.move`
- Interact with package:

```bash
sui client ptb \
--assign forge @0x88ffbd24069fefb561b2b773796b97ff3b59cc20ee6a49e8def88d2117d7cfc4 \
--assign to_address @0x9996eab084254d178e962057fa5358b0cd0ac898d1c8a056a5f07dd7aaec0b84 \
--move-call 0xcb7d30a11bb0b9a4c2b3b8881da01d7c743c7427d4dabff9760f263a8723e308::example::sword_create 3 3 \
--assign sword \
--transfer-objects "[sword]" to_address \
--gas-budget 20000000
```

```bash
sui client call \
--package 0xcb7d30a11bb0b9a4c2b3b8881da01d7c743c7427d4dabff9760f263a8723e308 \
--module example \
--function magic \
--args 0x5bfc2ed0dbd51172c6041706564b1b6c1bfc0abb4a7902f9d8cc1d32b9e750e8
```

```bash
sui client call \
--package 0x63d19c77dcff25d1dcd185a17687bc68c243e00f9b083c22ba3c6aa4cc9f595a \
--module uni \
--function mint \
--args 0xfbf67ca678f07fe2490df7ea1ca132f585716230f3cda066fe4f782060923c3a 1000000 0x9996eab084254d178e962057fa5358b0cd0ac898d1c8a056a5f07dd7aaec0b84
```

- Read object values - `sui client object 0x5bfc2ed0dbd51172c6041706564b1b6c1bfc0abb4a7902f9d8cc1d32b9e750e8`
