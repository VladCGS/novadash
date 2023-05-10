import { BLOCKCHAIN_NAMES } from '@app/common/types/exch-enum.type';

export const api0xSupportedLinks = {
  [BLOCKCHAIN_NAMES.ethereum]: 'https://api.0x.org',
  [BLOCKCHAIN_NAMES.goerli]: 'https://goerli.api.0x.org',
  [BLOCKCHAIN_NAMES.ropsten]: 'https://ropsten.api.0x.org',
  [BLOCKCHAIN_NAMES.polygon]: 'https://polygon.api.0x.org',
  [BLOCKCHAIN_NAMES.bsc]: 'https://bsc.api.0x.org',
  [BLOCKCHAIN_NAMES.optimism]: 'https://optimism.api.0x.org',
  [BLOCKCHAIN_NAMES.fantom]: 'https://fantom.api.0x.org',
  [BLOCKCHAIN_NAMES.celo]: 'https://celo.api.0x.org',
  [BLOCKCHAIN_NAMES.avalance]: 'https://avalance.api.0x.org',
};
