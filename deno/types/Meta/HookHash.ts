export interface HookHash {
  name: string
  description: string
  creator?: {
    name?: string
    mail?: string
    site?: string
  },
  xapp?: string
  appuuid?: string
  icon?: string
  verifiedAccounts?: string[],
  audits?: string[]
}
