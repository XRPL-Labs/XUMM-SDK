import type {xAppJwtPong} from '../'

export interface ApplicationDetails {
  quota?: Record<string, unknown>
  application: {
    uuidv4: string
    name: string
    webhookurl?: string
    disabled?: number
  },
  call?: {
    uuidv4: string
  },
  jwtData?: xAppJwtPong
}
