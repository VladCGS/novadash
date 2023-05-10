import { Fiat } from '@app/common/entities/alphaping/fiat.entity';
import { Injectable } from '@nestjs/common';
import { CreateFiatDTO } from '../dto/fiat-requests.dto';

@Injectable()
export class FiatService {
  async createOne(fiatBody: CreateFiatDTO) {
    return Fiat.create({ ...fiatBody }).save();
  }

  async update(fiat: CreateFiatDTO) {
    await Fiat.update({ symbol: fiat.symbol }, fiat);
    return Fiat.findOne({
      where: { symbol: fiat.symbol },
    });
  }
}
