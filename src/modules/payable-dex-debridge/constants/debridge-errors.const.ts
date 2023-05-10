import { ALPHAPING_CODES } from '@app/common/modules/error-handler/constants/alphaping-codes.const';

export const DEBRIDGE_ERRORS_TO_ALPHAPING_CODES: {
  [key: string]: ALPHAPING_CODES;
} = {
  INVALID_QUERY_PARAMETERS: ALPHAPING_CODES.invalidRequestOrInsufficientAmount,
  INCLUDED_GAS_FEE_NOT_COVERED_BY_INPUT_AMOUNT:
    ALPHAPING_CODES.tooSmallTokenValue,
  INCLUDED_GAS_FEE_CANNOT_BE_ESTIMATED_FOR_TRANSACTION_BUNDLE:
    ALPHAPING_CODES.invalidRequestOrInsufficientAmount,
  CONNECTOR_1INCH_RETURNED_ERROR:
    ALPHAPING_CODES.invalidRequestOrInsufficientAmount,
  INTERNAL_SERVER_ERROR: ALPHAPING_CODES.invalidRequestOrInsufficientAmount,
  INTERNAL_SDK_ERROR: ALPHAPING_CODES.invalidRequestOrInsufficientAmount,
};
