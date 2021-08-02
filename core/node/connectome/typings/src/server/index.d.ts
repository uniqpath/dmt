import http from 'http';
import https from 'https';
import { Channel, ChannelList, Eev, Keypair, ReadableStore } from '../utils';

export class Connectome extends ReadableStore {
  constructor({
    port,
    keypair,
    server,
    verbose
  }: {
    port?: number;
    keypair?: Keypair;
    server?: http.Server | https.Server;
    verbose?: boolean;
  });
  port: number;
  keypair: Keypair;
  server: http.Server | https.Server;
  verbose?: boolean;
  protocols: Record<string, any>;
  registerProtocol({
    protocol,
    onConnect
  }: {
    protocol: string;
    onConnect?: ({ channel }: { channel: Channel }) => void | Promise<void>;
  }): ChannelList;
  start(): void;
  wsServer: WsServer;
  publishState(): void;
  registeredProtocols(): string[];
  connectionList(): any[];
}
declare function newServerKeypair(): Keypair;

declare class WsServer extends Eev {
  constructor({ port, server, verbose }: { port: number; server: any; verbose?: boolean });
  webSocketServer: any;
  continueSetup({ verbose }: { verbose?: boolean }): void;
  enumerateConnections(): any[];
  periodicCleanupAndPing(): void;
}
