export interface IUserShippingAddress {
  nickname: string;
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  vat_number: string;
  phone: string;
  street1: string;
  street2: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
}

export interface IUserAddress {
  phone: string;
  street1: string;
  street2: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
}

export interface IUserBillingInfo {
  token_id: string;
  first_name: string;
  last_name: string;
  company: string;
  address: IUserAddress;
  number: string;
  month: string;
  year: string;
  cvv: string;
  vat_number: string;
  ip_address: string;
  gateway_token: string;
  gateway_code: string;
  amazon_billing_agreement_id: string;
  paypal_billing_agreement_id: string;
  fraud_session_id: string;
  transaction_type: RecurlyTransactionType;
  three_d_secure_action_result_token_id: string;
  iban: string;
  name_on_account: string;
  account_number: string;
  routing_number: string;
  sort_code: string;
  type: RecurlyBillingInfoType;
  account_type: RecurlyBillingInfoAccountType;
  tax_identifier: string;
  tax_identifier_type: RecurlyTaxIndentifierType;
  primary_payment_method: boolean;
  backup_payment_method: boolean;
  external_hpp_type: RecurlyExternalHppType;
  online_banking_payment_type: RecurlyOnlineBankingPaymentType;
}

export interface IUserAcquisition {
  cost: IUserAcquisitionCost;
  channel: RecurlyChannels;
  subchannel: string;
  campaign: string;
}

export interface IUserAcquisitionCost {
  currency: string;
  amount: number;
}

export interface IUserCreate {
  code: string;
  acquisition: IUserAcquisition;
  shipping_addresses: IUserShippingAddress[];
  username: string;
  email: string;
  preferred_locale: RecurlyLocales;
  cc_emails: string;
  first_name: string;
  last_name: string;
  company: string;
  vat_number: string;
  tax_exempt: boolean;
  exemption_certificate: string;
  parent_account_code: string;
  parent_account_id: string;
  bill_to: RecurlyBillTo;
  transaction_type: RecurlyTransactionType;
  dunning_campaign_id: string;
  invoice_template_id: string;
  address: IUserAddress;
  billing_info: IUserBillingInfo;
}

export enum RecurlyBillTo {
  PARENT = 'parent',
  SELF = 'self',
}
export enum RecurlyOnlineBankingPaymentType {
  IDEAL = 'ideal',
  SOFORT = 'sofort',
}
export enum RecurlyExternalHppType {
  ADYEN = 'adyen',
}
export enum RecurlyBillingInfoType {
  BACS = 'bacs',
  BECS = 'becs',
}
export enum RecurlyTaxIndentifierType {
  CPF = 'cpf',
  CNPJ = 'cnpj',
  CUIT = 'cuit',
}
export enum RecurlyBillingInfoAccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
}
export enum RecurlyTransactionType {
  MOTO = 'moto',
}

export enum RecurlyChannels {
  ADVERSTING = 'advertising',
  BLOG = 'blog',
  DIRECT_TRAFFIC = 'direct_traffic',
  EMAIL = 'email',
  EVENTS = 'events',
  MARKETING_CONTENT = 'marketing_content',
  ORGANIC_SEARCH = 'organic_search',
  OTHER = 'other',
  OUTBOUND_SALES = 'outbound_sales',
  PAID_SEARCH = 'paid_search',
  PULIBC_RELATIONS = 'public_relations',
  REFERRAL = 'referral',
  SOCIAL_MEDIA = 'social_media',
}

export enum RecurlyLocales {
  DA_DK = 'da-DK',
  DE_CH = 'de-CH',
  DE_DE = 'de-DE',
  EN_AU = 'en-AU',
  EN_CA = 'en-CA',
  EN_GB = 'en-GB',
  EN_IE = 'en-IE',
  EN_NZ = 'en-NZ',
  EN_US = 'en-US',
  ES_ES = 'es-ES',
  ES_MX = 'es-MX',
  ES_US = 'es-US',
  FI_FI = 'fi-FI',
  FR_CA = 'fr-CA',
  FR_FR = 'fr-FR',
  HI_IN = 'hi-IN',
  IT_IT = 'it-IT',
  JA_JP = 'ja-JP',
  KO_KR = 'ko-KR',
  NL_BE = 'nl-BE',
  NL_NL = 'nl-NL',
  PL_PL = 'pl-PL',
  PT_BR = 'pt-BR',
  PT_PT = 'pt-PT',
  RO_RO = 'ro-RO',
  RU_RU = 'ru-RU',
  SK_SK = 'sk-SK',
  SV_SE = 'sv-SE',
  TR_TR = 'tr-TR',
  ZH_CN = 'zh-CN',
}
