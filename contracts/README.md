# Contracts

### Commands

- Build project - `sui move build`
- Run tests - `sui move test`
- Publish package - `sui client publish`
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
