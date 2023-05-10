export interface IBinanceCoinMetadata {
  name: string;
  symbol: string;
  image: string;
  quantity: string;
  chains: { name: string; image: string | null; id: string }[];
}
