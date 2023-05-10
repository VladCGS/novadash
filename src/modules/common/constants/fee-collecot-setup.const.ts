import {
  SUPPORTED_EVM_SLUGS,
  SupportedEvmSlugsNames,
} from '@app/common/constants/supported-evm-chains.const';

/**
 * Rango Exchange
 * Rango Max 3% for
 * Rango don't have fee setup in quote
 * Rango fee we can compare by quote outputMin and swap outputMin. As of 22.02.2022 - it was 5% when defined 3%
 */
/**
 * deBridge
 */
/**
 * 0x Exchange
 * Example outcome: 100 USDC
 * We set up fee as 50%
 * So we make User outcome as 100+50%
 * new 100 % = 150%, 1% = 100 / 150 = 0.66 USDC per 1%
 * 100% = 0.66 * 100 = 66 USDC goes to User
 * 50% = 0.66 * 50 = 33 USDC - goes to us
 */

export const feeCollectorSetup: Record<
  SupportedEvmSlugsNames,
  { walletAddress: string; percent: number }
> = {
  [SUPPORTED_EVM_SLUGS.ETH]: {
    walletAddress: '0x2B072F008D0843DCbfEFC265cCF0371F6D9F6a10',
    percent: 3,
  },
  [SUPPORTED_EVM_SLUGS.POLYGON]: {
    walletAddress: '0x2B072F008D0843DCbfEFC265cCF0371F6D9F6a10',
    percent: 3,
  },
  [SUPPORTED_EVM_SLUGS.BSC]: {
    walletAddress: '0x2B072F008D0843DCbfEFC265cCF0371F6D9F6a10',
    percent: 3,
  },
  [SUPPORTED_EVM_SLUGS.ARBITRUM]: {
    walletAddress: '0x2B072F008D0843DCbfEFC265cCF0371F6D9F6a10',
    percent: 3,
  },
};
