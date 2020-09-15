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
