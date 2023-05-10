import { Fiat } from '@app/common/entities/alphaping';
import { Injectable } from '@nestjs/common';
import { IGetAllFiatsResponseData } from '../types/fiat-service.types';
import axios from 'axios';

@Injectable()
export class FiatHttpService {
  async fetchAndSaveFiats() {
    const FIATS_URL =
      'https://pkgstore.datahub.io/core/currency-codes/codes-all_json/data/029be9faf6547aba93d64384f7444774/codes-all_json.json';
    const { data: allFiats } = await axios.get<IGetAllFiatsResponseData[]>(
      FIATS_URL,
    );

    const filteredFiatsWithoutCode = allFiats.filter(
      (fiat) => fiat.AlphabeticCode,
    );

    const filteredFiatsWithoutDuplicates = filteredFiatsWithoutCode.reduce<
      Partial<Fiat>[]
    >((prev, curr) => {
      const { Currency: name, AlphabeticCode: symbol } = curr;

      if (!prev.find((el) => el.symbol === symbol)) {
        prev.push({ symbol, name });
      }

      return prev;
    }, []);

    const mappedDbFiats = filteredFiatsWithoutDuplicates.map((fiat) =>
      Fiat.create({ ...fiat }),
    );

    if (mappedDbFiats.length) await Fiat.save(mappedDbFiats);
  }
}
