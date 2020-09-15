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
