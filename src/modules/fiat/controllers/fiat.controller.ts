import { SUPPORTED_FIATS } from '@app/common/constants/supported-fiats.const';
import { ApiOKResponse, Roles } from '@app/common/decorators';
import { Admin, Fiat, User } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FiatHttpService } from '../services/fiat-http.service';
import { FiatService } from '../services/fiat.service';

@Controller('fiat')
@ApiTags('fiat')
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckIdValidGuard({ field: ['id'], findIn: 'userData' }),
)
@Roles(AppRoles.ADMIN)
export class FiatController {
  constructor(
    private fiatService: FiatService,
    private fiatHttpService: FiatHttpService,
  ) {}

  @Post('fetch-and-save-fiats')
  @HttpCode(200)
  @UseGuards(
    new CheckRecordFieldExistGuard([
      {
        Entity: Admin,
        dataSource: 'userData',
        entityField: 'id',
        sourceField: 'id',
      },
    ]),
  )
  @Roles(AppRoles.ADMIN)
  fetchAndSaveAllFiats() {
    return this.fiatHttpService.fetchAndSaveFiats();
  }

  @Get('list-for-user')
  @ApiOKResponse('List of supported fiats by our system', '')
  @UseGuards(
    new CheckRecordFieldExistGuard([
      {
        Entity: User,
        dataSource: 'userData',
        entityField: 'id',
        sourceField: 'id',
      },
    ]),
  )
  @Roles(AppRoles.USER)
  async getUserFiatList(): Promise<Fiat[]> {
    const supportedFiats = await Fiat.find({ where: SUPPORTED_FIATS });

    /**
     * In our database we have different countries with the same symbol fiat
     * So there we just removing them and returning back only one single entity of that fiat
     *
     * Dunno how we can fix that, maybe put specific flag for fiat's native country
     * Not sure for now how to implement it in better way
     */

    const removedDuplicates = supportedFiats.reduce<Fiat[]>((prev, curr) => {
      if (prev.find((k) => k.symbol === curr.symbol)) return prev;

      prev.push(curr);

      return prev;
    }, []);

    return removedDuplicates;
  }
}
