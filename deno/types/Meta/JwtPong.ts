export interface JwtPong {
  pong: boolean
  'client_id': string
  state?: string
  scope?: string
  nonce?: string
  aud: string
  sub: string
  'app_uuidv4': string
  'app_name': string
  'payload_uuidv4': string
  'usertoken_uuidv4': string
  iat: number
  exp: number
  iss: string
}
