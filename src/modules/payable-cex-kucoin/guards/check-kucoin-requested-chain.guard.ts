import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ALPHAPING_CODES } from '@app/common/modules/error-handler/constants/alphaping-codes.const';
import { getDataFromObject } from '@app/common/helpers';
import { Chain } from '@app/common/entities/transactions';
import { formAlphapingExceptionBody } from '@app/common/utils/form-alphaping-exception-body.util';

interface ICheckKucoinChainConfif {
  findIn?: 'params' | 'body' | 'query' | 'userData';
  field?: Array<string> | null;
  isFieldOptional?: boolean;
}
@Injectable()
export class CheckKucoinRequestedChainGuard implements CanActivate {
  constructor(private config: ICheckKucoinChainConfif) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const {
      findIn = 'params',
      field = ['chainId'],
      isFieldOptional,
    } = this.config;

    const request = context.switchToHttp().getRequest();

    const extractedIdData = getDataFromObject(request[findIn], field) as
      | string
      | undefined;
    if (isFieldOptional && !extractedIdData) {
      return true;
    }

    const foundChain = await Chain.findOneBy({
      id: extractedIdData,
    });

    if (foundChain.slug !== 'eth') {
      throw new HttpException(
        formAlphapingExceptionBody(ALPHAPING_CODES.kucoinOnlyETHChainAllowed),
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }
}
