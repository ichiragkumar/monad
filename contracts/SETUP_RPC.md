# Setting Up Monad Testnet RPC

## Error: RPC URL Not Found

If you're seeing an error like:
```
Error: getaddrinfo ENOTFOUND actual-testnet-rpc.monad.xyz
```

This means the RPC URL in your `.env` file is incorrect or a placeholder.

## How to Find the Correct Monad Testnet RPC URL

### Option 1: Check Monad Official Documentation
Visit the official Monad documentation or website to find the testnet RPC endpoint:
- https://www.monad.xyz/
- Check their documentation for "Testnet" or "RPC" information
- Look for developer resources or network configuration

### Option 2: Check Monad Discord/Community
- Join Monad's Discord or community channels
- Ask for the testnet RPC URL
- Check pinned messages or announcements

### Option 3: Use Public RPC Providers
If Monad testnet is available on public RPC providers:
- Check Alchemy, Infura, or QuickNode for Monad testnet support
- Some providers may offer Monad testnet endpoints

### Option 4: Run Local Node (Advanced)
If you're running a local Monad testnet node:
```env
MONAD_TESTNET_RPC=http://localhost:8545
```

## Update Your .env File

Once you have the correct RPC URL, update your `.env` file:

```env
PRIVATE_KEY=your_private_key_here
MONAD_TESTNET_RPC=https://correct-testnet-rpc-url.monad.xyz
MONAD_CHAIN_ID=10143
```

**Important:** 
- Replace `https://correct-testnet-rpc-url.monad.xyz` with the actual RPC URL
- The URL should start with `https://` or `http://`
- Make sure the URL is accessible from your network

## Verify RPC Connection

You can test if the RPC URL works by running:

```bash
curl https://your-testnet-rpc-url.monad.xyz
```

Or check the network in Hardhat:

```bash
npx hardhat console --network monadTestnet
```

Then try:
```javascript
await ethers.provider.getBlockNumber()
```

If this works, your RPC URL is correct!

## Common RPC URL Formats

Monad testnet RPC URLs might look like:
- `https://testnet-rpc.monad.xyz`
- `https://rpc.testnet.monad.xyz`
- `https://monad-testnet-rpc.example.com`
- `wss://testnet-rpc.monad.xyz` (for WebSocket)

## Need Help?

If you can't find the RPC URL:
1. Check Monad's official documentation
2. Ask in Monad's community channels
3. Contact Monad team for testnet access
4. For now, you can test contract compilation without deploying:
   ```bash
   npm run compile
   ```

