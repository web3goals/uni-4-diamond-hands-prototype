export function ipfsToHttp(ipfs: string): string {
  return ipfs.replace(
    "ipfs://",
    "https://yellow-mute-echidna-168.mypinata.cloud/ipfs/"
  );
}
