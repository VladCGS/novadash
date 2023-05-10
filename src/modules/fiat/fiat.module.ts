import { Module } from '@nestjs/common';
import { FiatController } from './controllers/fiat.controller';
import { FiatHttpService } from './services/fiat-http.service';
import { FiatService } from './services/fiat.service';

@Module({
  providers: [FiatService, FiatHttpService],
  controllers: [FiatController],
})
export class FiatModule {}
