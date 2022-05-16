export interface Options {
  endpoint?: string;
  protocol?: string;
  remotePubkey?: string;
  keypair?: Keypair;
  rpcRequestTimeout?: number;
  verbose?: boolean;
  tag?: any;
  dummy?: any;
}

export class ProtocolStore extends Eev {
  constructor(
    initialState?: {},
    {
      latent
    }?: {
      latent?: boolean;
    }
  );
  latent: boolean;
  state: any;
  lastAnnouncedState: any;
  sync(channelList: any): void;
  set(
    state: any,
    {
      announce
    }?: {
      announce?: boolean;
    }
  ): void;
  update(
    patch: any,
    {
      announce
    }?: {
      announce?: boolean;
    }
  ): void;
  get(): typeof this.state;
  announceStateChange(announce?: boolean): void;
}

export interface Keypair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  privateKeyHex: string;
  publicKeyHex: string;
}

declare class protocolState extends WritableStore {
  connector: Connector;
  wireStateReceived: boolean;
  field(name: string): any;
}
declare class connectionState extends WritableStore {
  fields: Record<string, any>;
  connector: Connector;
}

export class Eev {
  __events_list: Record<string, any>;
  on(name: string, fn: (...args) => void): void;
  off(name: string, fn: (...args) => void): void;
  removeListener(...args: any[]): void;
  emit(name: string, data: any): void;
}
export class ReadableStore extends Eev {
  constructor(initialState: any);
  state: any;
  subscriptions: any[];
  get(): typeof this.state;
  subscribe(handler: any): () => void;
  announceStateChange(): void;
}
export class WritableStore extends ReadableStore {
  set(state: any): void;
}
export class Connector extends Eev {
  constructor({ endpoint, protocol, keypair, rpcRequestTimeout, verbose, tag, dummy }?: Options);
  protocol: string;
  clientPrivateKey: Uint8Array;
  clientPublicKey: Uint8Array;
  clientPublicKeyHex: string;
  rpcClient: RpcClient;
  endpoint: string;
  verbose: boolean;
  tag: any;
  sentCount: number;
  receivedCount: number;
  successfulConnectsCount: number;
  state: protocolState;
  connectionState: connectionState;
  connected: WritableStore;
  send(data: any): void;
  signal(signal: string, data?: any): void;
  wireReceive({
    jsonData,
    encryptedData,
    rawMessage
  }: {
    jsonData: Record<string, any>;
    encryptedData: any;
    rawMessage: any;
  }): void;
  field(name: string): any;
  isReady(): boolean;
  closed(): boolean;
  decommission(): void;
  decommissioned: boolean;
  connectStatus(connected: any): void;
  transportConnected: boolean;
  ready: boolean;
  connectedAt: number;
  remoteObject(handle: string): {
    call: (methodName: string, params?: any[]) => any;
  };
  attachObject(handle: string, obj: any): void;
  diffieHellman({
    clientPrivateKey,
    clientPublicKey,
    protocol
  }: {
    clientPrivateKey: any;
    clientPublicKey: any;
    protocol: string;
  }): Promise<any>;
  sharedSecret: any;
  _remotePubkeyHex: any;
  clientPubkey(): string;
  remotePubkeyHex(): any;
  remoteAddress(): any;
}

export class Channel extends Eev {
  constructor(
    ws: any,
    {
      rpcRequestTimeout,
      verbose
    }: {
      rpcRequestTimeout?: number;
      verbose?: boolean;
    }
  );
  ws: any;
  verbose: boolean;
  reverseRpcClient: RpcClient;
  sentCount: number;
  receivedCount: number;
  stateFields: Record<string, any>;
  stateFieldsSubscriptions: any[];
  state(name: any, _state: any): any;
  clearState(...names: any[]): void;
  setProtocol(protocol: string): void;
  protocol: string;
  setSharedSecret(sharedSecret: any): void;
  sharedSecret: any;
  isReady({ warn }?: { warn?: boolean }): boolean;
  remoteAddress(): any;
  remoteIp(): any;
  setRemotePubkeyHex(remotePubkeyHex: any): void;
  _remotePubkeyHex: any;
  remotePubkeyHex(): any;
  send(message: any): void;
  signal(signal: any, data: any): void;
  messageReceived(message: any): void;
  attachObject(handle: string, obj: any): void;
  remoteObject(handle: string): {
    call: (methodName: string, params?: any[]) => any;
  };
  terminate(): void;
  terminated(): any;
  closed(): boolean;
}
export class ChannelList extends Eev {
  constructor({ protocol }: { protocol: string });
  protocol: string;
  channels: Channel[];
  state: ProtocolStore;
  add(channel: Channel): void;
  signalAll(signal: any, data: any): void;
  sendAll(msg: any): void;
  remoteCallAll(remoteObjectHandle: any, method: any, args: any): void;
  multiCall(remoteObjectHandle: any, method: any, args: any): Promise<any[]>;
  reportStatus(): void;
  [Symbol.iterator](): {
    next: () =>
      | {
          value: any;
          done: boolean;
        }
      | {
          done: boolean;
        };
  };
}

export class RpcClient {
  constructor(connectorOrServersideChannel: Connector | Channel, requestTimeout: number);
  connectorOrServersideChannel: Connector | Channel;
  remoteObjects: Record<string, any>;
  requestTimeout: number;
  remoteObject(methodPrefix: any): any;
  jsonrpcMsgReceive(stringMessage: string): void;
}
