interface Endpoint {
  name: string
  url: string
}

interface Explorer {
  name: string
  "url_tx": string
  "url_account"?: string
  "url_ctid"?: string
}

export interface Rails {
  [networkKey: string]: {
    chain_id: number
    color: string
    name: string
    is_livenet: boolean
    native_asset: string
    endpoints: Endpoint[]
    explorers: Explorer[]
    rpc?: string
    definitions?: string
    icons: {
      icon_square: string
      icon_asset: string
    }
  }
}
