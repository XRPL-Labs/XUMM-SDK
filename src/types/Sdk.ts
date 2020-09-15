export interface ApplicationDetails {
  quota: object
  application: {
    uuidv4: string
    name: string
    webhookurl: string
    disabled: number
  },
  call: {
    uuidv4: string
  }
}

export interface Pong {
  pong: boolean
  auth: ApplicationDetails
}

export interface AnyJson {
  [key: string]: AnyJson | any
}

export interface CuratedAssetsResponse {
  issuers: string[]
  currencies: string[]
  details: {
    [issuer: string]: {
      id: number
      name: string
      domain?: string
      avatar?: string
      shortlist: number
      currencies: {
        [currencyCode: string]: {
          id: number
          issuer_id: number
          currency: string
          name: string
          avatar?: string
          shortlist: number
        }
      }
    }
  }
}
