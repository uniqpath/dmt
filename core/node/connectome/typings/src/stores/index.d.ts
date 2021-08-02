import { Connector, Eev, Keypair, Options, WritableStore } from '../utils';

export class LogStore extends WritableStore {
  constructor();
  addToLog(
    {
      origConsoleLog,
      limit
    }: {
      origConsoleLog: any;
      limit: any;
    },
    ...args: any[]
  ): void;
}
export class MultiConnectedStore extends MergeStore {
  constructor({
    endpoint,
    host,
    port,
    protocol,
    keypair,
    connectToDeviceKey,
    logStore,
    rpcRequestTimeout,
    verbose
  }: Omit<Options, 'remotePublicKey' | 'dummy' | 'tag'> & {
    connectToDeviceKey?;
    logStore?: LogStore;
    host?: string;
    port?: number;
  });
  publicKey: any;
  privateKey: any;
  keypair: Keypair;
  port: number;
  protocol: string;
  logStore: LogStore;
  rpcRequestTimeout: number;
  verbose?: boolean;
  connectors: Record<string, any>;
  connected: WritableStore;
  connectDevice: ConnectDevice;
  switchDevice: SwitchDevice;
  localConnector: Connector;
  signal(signal: any, data?: any): void;
  signalLocalDevice(signal: any, data: any): void;
  remoteObject(objectName: any): any;
  preconnect({ host, deviceKey }: { host: any; deviceKey: any }): void;
  switch({ host, deviceKey, deviceName }: { host: string; deviceKey: string; deviceName: string }): void;
  activeConnector(): any;
  activeDeviceKey(): any;
}

export class SlottedStore extends Eev {
  constructor(
    initialState?: {},
    {
      loadState,
      saveState,
      omitStateFn,
      removeStateChangeFalseTriggers
    }?: {
      loadState?: any;
      saveState?: any;
      omitStateFn?: (x: any) => any;
      removeStateChangeFalseTriggers?: (x: any) => any;
    }
  );
  omitStateFn: (x: any) => any;
  saveState: any;
  removeStateChangeFalseTriggers: (x: any) => any;
  slots: Record<string, any>;
  kvStore: KeyValueStore;
  lastAnnouncedState: any;
  stateChangesCount: number;
  subscriptions: any[];
  syncOver(channelList: any): void;
  channelList: any;
  sendRemote({ state, diff }: { state: any; diff: any }): void;
  state(): Record<string, any>;
  get(key: any): any;
  omitAndCloneState(): any;
  slot(name: any): any;
  update(
    patch: any,
    {
      announce,
      skipDiffing
    }?: {
      announce?: boolean;
      skipDiffing?: boolean;
    }
  ): void;
  save(): void;
  lastSavedState: any;
  announceStateChange(announce?: boolean, skipDiffing?: boolean): void;
  tagState({ state }: { state: any }): void;
  subscribe(handler: any): () => void;
  pushStateToLocalSubscribers(): void;
}
declare class MergeStore extends WritableStore {
  constructor(initialState?: {});
  setMerge(patch: any): void;
  clearState({ except }?: { except?: any[] }): void;
}
declare class ConnectDevice {
  constructor({
    mcs,
    foreground,
    connectToDeviceKey
  }: {
    mcs: any;
    foreground: any;
    connectToDeviceKey: any;
  });
  mcs: any;
  foreground: any;
  connectToDeviceKey: any;
  createConnector({ host }: { host: any }): Connector;
  getDeviceKey(state: any): any;
  connectThisDevice({ host }: { host: any }): Connector;
  thisDeviceAlreadySetup: boolean;
  connectOtherDevice({ host, deviceKey }: { host: any; deviceKey: any }): void;
  initNewConnector({ deviceKey, connector }: { deviceKey: any; connector: any }): void;
  setConnectedStore({ deviceKey, connector }: { deviceKey: any; connector: any }): void;
}
declare class SwitchDevice extends Eev {
  constructor({ mcs, connectDevice, foreground }: { mcs: any; connectDevice: any; foreground: any });
  mcs: any;
  connectDevice: any;
  foreground: any;
  switchState({ deviceKey, deviceName }: { deviceKey: any; deviceName: any }): void;
  switch({ host, deviceKey, deviceName }: { host: any; deviceKey: any; deviceName: any }): void;
}

declare class KeyValueStore {
  state: Record<string, any>;
  update(patch: any): void;
  replaceBaseKey(baseKey: any, value: any): void;
  clearBaseKey(baseKey: any): void;
  replaceSubKey({ baseKey, key, value }: { baseKey: any; key: any; value: any }): void;
  removeSubKey({ baseKey, key }: { baseKey: any; key: any }): void;
  pushToArray(baseKey: any, value: any): void;
  removeFromArray(baseKey: any, removePredicate: any): void;
  replaceArrayElement(baseKey: any, selectorPredicate: any, value: any): boolean;
  updateArrayElement(baseKey: any, selectorPredicate: any, value: any): boolean;
}
