import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import { StateStorageService } from './state-storage.service';

@Injectable()
export class StateStorageInitializerService
  extends StateStorageService
  implements OnModuleInit
{
  onModuleInit() {
    this.createStatesDirectoryIfNotExist();
    this.logger.log('State manager initialized!');
  }

  private statesDirectoryExists(): boolean {
    return fs.existsSync(this.getStateDirectory());
  }

  private createStatesDirectoryIfNotExist() {
    if (!this.statesDirectoryExists()) {
      this.logger.warn(
        `States directory '${this.getStateDirectory()}' does not exist! Creating...`,
      );
      fs.mkdirSync(this.getStateDirectory());
    }
  }
}
