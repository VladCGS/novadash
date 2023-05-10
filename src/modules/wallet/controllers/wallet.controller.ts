import { Roles } from '@app/common/decorators';
import { IdDTO } from '@app/common/dtos';
import { User } from '@app/common/entities/alphaping/user.entity';
import { Chain, ToolMeta } from '@app/common/entities/transactions';
import { Wallet } from '@app/common/entities/transactions/wallet.entity';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { checkIfChainSlugSupported } from '@app/common/helpers/check-if-chain-slug-supported.helper';
import { TOOLS_META_STATIC } from '@app/common/modules/common/tools-meta.const';
import { AppRoles } from '@app/common/types';
import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WALLET_PROVIDERS_TO_TOOLS_NAME } from '@app/common/constants/providers-to-meta.const';
import { CreateWalletDTO, UpdateWalletDTO } from '../dto/wallet-requests.dto';
import { WalletService } from '../services/wallet.service';

@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckIdValidGuard({ field: ['id'], findIn: 'userData' }),
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
@Controller('wallet')
@ApiTags('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post('/')
  @UseGuards(
    new CheckRecordFieldExistGuard([
      {
        dataSource: 'userData',
        sourceField: 'id',
        Entity: User,
        entityField: 'id',
      },
      {
        dataSource: 'body',
        sourceField: 'chainSlug',
        Entity: Chain,
        entityField: 'slug',
      },
    ]),
  )
  async addOne(@Req() req, @Body() body: CreateWalletDTO): Promise<Wallet> {
    const { id } = req.userData;

    const isSupported = checkIfChainSlugSupported(body.chainSlug);
    if (!isSupported) {
      throw new HttpException(
        "This wallets' chain is not supported",
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    const foundChain = await Chain.findOneBy({
      slug: body.chainSlug,
    });

    const foundMeta = await ToolMeta.findOneBy({
      name: TOOLS_META_STATIC[WALLET_PROVIDERS_TO_TOOLS_NAME[body.provider]]
        .name,
    });

    const newWalletRecord = Wallet.create({
      ...body,
      user: {
        id,
      },
      chain: {
        id: foundChain.id,
      },
      meta: {
        id: foundMeta.id,
      },
    });

    const savedWallet = await Wallet.save(newWalletRecord);
    savedWallet.chain = foundChain;

    return savedWallet;
  }

  @Patch('/:id')
  @UseGuards(
    new CheckRecordFieldExistGuard([
      {
        dataSource: 'params',
        sourceField: 'id',
        Entity: Wallet,
        entityField: 'id',
      },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() body: UpdateWalletDTO,
  ): Promise<Wallet> {
    return this.walletService.update(id, body);
  }

  @Delete('/:id')
  @UseGuards(
    new CheckRecordFieldExistGuard([
      {
        dataSource: 'userData',
        sourceField: 'id',
        Entity: User,
        entityField: 'id',
      },
      {
        dataSource: 'params',
        sourceField: 'id',
        Entity: Wallet,
        entityField: 'id',
      },
    ]),
  )
  async delete(@Req() req, @Param('id') id: string): Promise<IdDTO> {
    await Wallet.delete({ id });

    return {
      id,
    };
  }
}
