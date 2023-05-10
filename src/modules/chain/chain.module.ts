import { Module } from '@nestjs/common';
import { StateManagerModule } from '../state-manager/state-manager.module';
import { ChainAdminController } from './controllers/chain-admin.controller';
import { ChainUserController } from './controllers/chain-user.controller';
import { ChainMetaService } from './services/chain-meta.service';
import { ChainService } from './services/chain.service';
import { InitChainsService } from './services/init-chains.service';
import { LoadChainService } from './services/load-chain.service';
import { ExchSetInitModule } from '@app/common/modules/exch-set-init/exch-set-init.module';

@Module({
  imports: [StateManagerModule, ExchSetInitModule],
  providers: [
    LoadChainService,
    ChainService,
    InitChainsService,
    ChainMetaService,
  ],
  controllers: [ChainUserController, ChainAdminController],
  exports: [LoadChainService, ChainService, InitChainsService],
})
export class ChainModule {}
