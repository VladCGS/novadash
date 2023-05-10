import { Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import {
  AppStatusesBaseEnum,
  STATE_EVENTS,
} from '../../types/alphaping-base-state.types';

export class AppBaseState<T = AppStatusesBaseEnum> extends EventEmitter {
  protected logger = new Logger(this.stateName);

  protected internalState: T;

  constructor(private stateName: string) {
    super();

    this.on(STATE_EVENTS.STATE_LOADED, () => {
      this.onStateLoaded();
    });

    this.on(STATE_EVENTS.STATE_WRITTEN, () => {
      this.onStateWritten();
    });
  }

  getName(): string {
    return this.stateName;
  }

  getSerializedState(): string {
    return JSON.stringify(this.internalState);
  }

  onStateLoaded(): void {
    this.logger.log('State loaded!');
  }

  onStateWritten(): void {
    this.logger.log('State written!');
  }

  getInternalState(): T {
    return this.internalState;
  }

  deserializeState(serializedState: string): void {
    this.internalState = JSON.parse(serializedState);
  }

  update(newInternalState: T): void {
    this.internalState = newInternalState;
    this.emit(STATE_EVENTS.STATE_UPDATED, this);
  }
}
