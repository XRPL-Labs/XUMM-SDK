import {AnyJson} from './AnyJson'

export interface XrplTransaction {
  txid: string
  balanceChanges: {
    [account: string]: {
      counterparty: string
      currency: string
      value: string
    }[]
  }
  node: string
  transaction: AnyJson
}
