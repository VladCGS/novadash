declare namespace NodeJS {
  export interface ProcessEnv {
    CLIENT_UR?: string;
    // BACKEND PORT
    PORT?: string;
    // SECRETS
    JWT_SECRET?: string;
    ADMIN_SECRET?: string;
    SECRET_COOKIE?: string;
    // API keys
    RECURLY_API_KEY?: string;
    STRIPE_API_KEY?: string;
    RANGO_API_KEY?: string;
    // MAILER SETUP
    EMAIL_HOST?: string;
    EMAIL_SERVICE?: string;
    EMAIL_SMTP_PORT?: string;
    SENDER_EMAIL?: string;
    SENDER_PASS?: string;
    //AWS KMS
    KMS_REGION?: string;
    //0x KEYS
    EXCH_0X_API_URL?: string;
    //ALCHEMY
    ALCHEMY_ETH_MAINNET?: string;
    //COINGECKO
    COIN_GECKO_API_URL?: string;
    //TRANSAK
    TRANSAK_API_URL?: string;
    TRANSAK_LIVE_WIDGET_URL?: string;
    TRANSAK_STAGING_WIDGET_URL?: string;
    TRANSAK_LIVE_API_KEY?: string;
    TRANSAK_STAGING_API_KEY?: string;
    //DEBRIDGE
    DEBRIDGE_API_URL?: string;

    // STATES
    STATES_DIR?: string;

    // LOGS
    LOGS_PATH?: string;
    LOGGER_NAME?: string;
  }
}
