export type AbiType = 'function' | 'constructor' | 'event' | 'fallback';
export type StateMutabilityType = 'pure' | 'view' | 'nonpayable' | 'payable';

export interface AbiItem {
  anonymous?: boolean;
  constant?: boolean;
  inputs?: IAbiInput[];
  name?: string;
  outputs?: IAbiOutput[];
  payable?: boolean;
  stateMutability?: StateMutabilityType;
  type: AbiType;
  gas?: number;
}

export interface IAbiInput {
  name: string;
  type: string;
  indexed?: boolean;
  components?: IAbiInput[];
  internalType?: string;
}

export interface IAbiOutput {
  name: string;
  type: string;
  components?: IAbiOutput[];
  internalType?: string;
}
