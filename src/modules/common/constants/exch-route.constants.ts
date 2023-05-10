export const PAYABLE_ROUTES = {
  onRampBuy: {
    getQuote: 'on-ramp-buy-quote',
    getPaymentData: 'on-ramp-buy-payment-data',
  },
  onRampSell: {
    getQuote: 'on-ramp-sell-quote',
    getPaymentData: 'on-ramp-sell-payment-data',
  },
  offRampBuy: {
    getQuote: 'off-ramp-buy-quote',
    getPaymentData: 'off-ramp-buy-payment-data',
  },
  offRampSell: {
    getQuote: 'off-ramp-sell-quote',
    getPaymentData: 'off-ramp-sell-payment-data',
  },
  swapBuy: {
    getQuote: 'swap-buy-quote',
    getPaymentData: 'swap-buy-payment',
  },
  swapSell: {
    getQuote: 'swap-sell-quote',
    getPaymentData: 'swap-sell-payment',
  },
  withdrawalCEX: {
    quote: 'withdrawal-quote',
    call: 'call-withdraw',
    status: 'withdraw-status',
  },
  swapCEX: {
    quote: 'swap-cex-quote',
    call: 'call-swap',
    status: 'swap-status',
  },
  depositCEX: {
    status: 'deposit-status',
    depositAddress: 'deposit-address',
  },
};
