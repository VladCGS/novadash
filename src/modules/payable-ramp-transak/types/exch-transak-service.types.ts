import {
  OffRampBuyGetPaymentDataDTO,
  OffRampSellGetPaymentDataDTO,
} from '../../common/dto/payable/payable-off-ramp.requests.dto';
import {
  OnRampBuyGetPaymentDataDTO,
  OnRampSellGetPaymentDataDTO,
} from '../../common/dto/payable/payable-on-ramp.requests.dto';

interface ITransakPaymentDataOptionsBase {
  userId: string;
}

export interface ITransakPaymentDataOptionsOnRamp
  extends ITransakPaymentDataOptionsBase {
  body: OnRampSellGetPaymentDataDTO | OnRampBuyGetPaymentDataDTO;
}

export interface ITransakPaymentDataOptionsOffRamp
  extends ITransakPaymentDataOptionsBase {
  body: OffRampSellGetPaymentDataDTO | OffRampBuyGetPaymentDataDTO;
}
