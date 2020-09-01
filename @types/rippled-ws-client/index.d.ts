declare module 'rippled-ws-client' {
  interface xrplResponse {
    [key: string]: any
  }

  export default class Client {
    constructor (wssEndpoint: string)
    on (eventName: string, method: Function): void
    close (): void
    send<xrplResponse> (command: object): Promise<xrplResponse>
  }
}
