export interface UserTokenValidity {
  'user_token': string
  active: boolean
  issued?: number
  expires?: number
}

export interface UserTokenResponse {
  tokens: UserTokenValidity[]
}
