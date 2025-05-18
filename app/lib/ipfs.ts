export function ipfsToHttp(ipfs: string | undefined): string | undefined {
  return ipfs?.replace(
    "ipfs://",
    "https://yellow-mute-echidna-168.mypinata.cloud/ipfs/"
  );
}
