const Joi = require('joi');

export const checkEnvSchemaAlphaping = Joi.object({
  // FRONT-END
  CLIENT_URL: Joi.string().required(),
  // BACKEND PORT
  PORT: Joi.number().required(),
  // SECRETS
  JWT_SECRET: Joi.string().required(),
  ADMIN_SECRET: Joi.string().required(),
  SECRET_COOKIE: Joi.string().required(),
  // API keys
  RECURLY_API_KEY: Joi.string().required(),
  STRIPE_API_KEY: Joi.string().required(),
  RANGO_API_KEY: Joi.string().required(),
  // MAILER SETUP
  EMAIL_HOST: Joi.string().required(),
  EMAIL_SERVICE: Joi.string().required(),
  EMAIL_SMTP_PORT: Joi.number().required(),
  SENDER_EMAIL: Joi.string().required(),
  SENDER_PASS: Joi.string().required(),
  //AWS KMS
  KMS_REGION: Joi.string().required(),
  //0x KEYS
  EXCH_0X_API_URL: Joi.string().required(),
  //ALCHEMY
  ALCHEMY_ETH_MAINNET: Joi.string().required(),
  //COINGECKO
  COIN_GECKO_API_URL: Joi.string().required(),
  //TRANSAK
  TRANSAK_API_URL: Joi.string().required(),
  TRANSAK_LIVE_WIDGET_URL: Joi.string().required(),
  TRANSAK_STAGING_WIDGET_URL: Joi.string().required(),
  TRANSAK_LIVE_API_KEY: Joi.string().required(),
  TRANSAK_STAGING_API_KEY: Joi.string().required(),
  //DEBRIDGE
  DEBRIDGE_API_URL: Joi.string().required(),

  //PROD_MODE
  PROD_MODE: Joi.boolean().required(),

  // LOGS
  LOGS_PATH: Joi.string().required(),
  LOGGER_NAME: Joi.string().required(),
});
