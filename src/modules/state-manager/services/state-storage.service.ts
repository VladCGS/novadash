import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fsAsync from 'fs/promises';
import * as path from 'path';
import { AppBaseState } from '../app-states/base/app-base.state';
import { STATE_EVENTS } from '../types/alphaping-base-state.types';

@Injectable()
export class StateStorageService {
  private states: Map<string, AppBaseState<string>> = new Map();
  protected readonly logger = new Logger(StateStorageService.name);
  private readonly statesDirectory: string;

  constructor(private configService: ConfigService) {
    this.statesDirectory = this.configService.get<string>('STATES_DIR');
  }

  getStateDirectory() {
    return this.statesDirectory;
  }

  getStates() {
    return this.states;
  }

  getState(stateName: string): AppBaseState<string> {
    return this.states.get(stateName);
  }

  async addState(stateObject: AppBaseState<string>) {
    const foundState = this.states.get(stateObject.getName());
    if (foundState) return;
    this.states.set(stateObject.getName(), stateObject);

    await this.loadStateFromDisk(stateObject.getName());

    stateObject.on(
      STATE_EVENTS.STATE_UPDATED,
      async (updatedStateObject: AppBaseState<string>) => {
        return this.updateState(updatedStateObject);
      },
    );
  }

  private async updateState(updatedStateObject: AppBaseState<string>) {
    const stateName = updatedStateObject.getName();
    this.logger.log(`State |${stateName}| updated and will write to the disk!`);

    await this.writeStateFile(stateName);
  }

  private async readStateFile(stateName: string): Promise<string> {
    const serializedState = await fsAsync.readFile(
      path.join(this.statesDirectory, `state-${stateName}.json`),
      { encoding: 'utf-8' },
    );
    return serializedState;
  }

  private async loadStateFromDisk(stateName: string) {
    const foundState = this.states.get(stateName);
    if (!foundState) return;

    try {
      const stateFileContent = await this.readStateFile(stateName);
      foundState.deserializeState(stateFileContent);
      foundState.onStateLoaded();
    } catch (err) {
      this.logger.warn(`No saved state for |${stateName}|`);
      return;
    }
  }

  private async writeStateFile(stateName: string) {
    const foundState = this.states.get(stateName);
    if (!foundState) return;

    await fsAsync.writeFile(
      path.join(this.statesDirectory, `state-${stateName}.json`),
      foundState.getSerializedState(),
    );
    foundState.onStateWritten();
  }
}
