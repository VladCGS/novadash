export interface IChainIdNetworkItem {
  name: string;
  chain: string;
  icon?: string;
  rpc: string[];
  faucets: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  infoURL: string;
  shortName: string;
  chainId: number;
  networkId: number;
  slip44?: number;
  ens?: {
    registry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
  };
  explorers?: {
    name: string;
    url: string;
    standard: string;
  }[];
}
