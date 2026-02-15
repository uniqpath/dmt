import { Connector, Keypair, Options, ReadableStore } from '../utils';

export class ConnectorPool extends ReadableStore {
  options: Options;
  connectors: Record<string, any>;
  isPreparingConnector: Record<string, any>;
  getConnector({ host, port, tag }: { host: any; port: any; tag: any }): Promise<any>;
  setupConnectorReactivity(connector: Connector): void;
  publishState(): void;
  connectionList(): {
    address: string;
    protocol: string;
    remotePubkeyHex: string;
    ready: any;
    readyState: any;
    connectedAt: number;
    lastMessageAt: number;
  }[];
}
export const concurrency: Readonly<{
  __proto__: any;
  promiseTimeout: typeof promiseTimeout;
  requireConditions: typeof requireConditions;
}>;
export function connect(opts: Options & { port?: number; host?: string }): Connector;
export function newClientKeypair(): Keypair;

declare function promiseTimeout(ms: any, promise: any): Promise<any>;
declare function requireConditions(num: any, callback: any): ConditionsChecker;

declare class ConditionsChecker {
  constructor(num: any, callback: any);
  num: any;
  callback: any;
  counter: number;
  oneConditionFulfilled(): void;
}
