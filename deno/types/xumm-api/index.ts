// deno-lint-ignore-file

// Type definitions for non-npm package xumm-sdk 0.1
// Project: https://xumm.app
// Definitions by: Wietse Wind <https://github.com/WietseWind>
// Definitions: https://github.com/XRPL-Labs/XUMM-SDK

const XummTxTypes = [
  'SignIn',
  'PaymentChannelAuthorize'
] as const

const XrplTxTypes = [
  'AccountDelete',
  'AccountSet',
  'CheckCancel',
  'CheckCash',
  'CheckCreate',
  'ClaimReward',
  'DepositPreauth',
  'EscrowCancel',
  'EscrowCreate',
  'EscrowFinish',
  'Import',
  'Invoke',
  'NFTokenAcceptOffer',
  'NFTokenBurn',
  'NFTokenCancelOffer',
  'NFTokenCreateOffer',
  'NFTokenMint',
  'OfferCancel',
  'OfferCreate',
  'Payment',
  'PaymentChannelClaim',
  'PaymentChannelCreate',
  'PaymentChannelFund',
  'Remit',
  'SetHook',
  'SetRegularKey',
  'SignerListSet',
  'TicketCreate',
  'TrustSet',
  'URITokenBurn',
  'URITokenBuy',
  'URITokenCancelSellOffer',
  'URITokenCreateSellOffer',
  'URITokenMint'
] as const

export type XummTransactionType = typeof XummTxTypes[number]
export type XrplTransactionType = typeof XrplTxTypes[number]

export type XummCancelReason = 'OK'
  | 'ALREADY_CANCELLED'
  | 'ALREADY_RESOLVED'
  | 'ALREADY_OPENED'
  | 'ALREADY_EXPIRED'

export type XummTransactionApprovalType = 'PIN'
  | 'BIOMETRIC'
  | 'PASSPHRASE'
  | 'OTHER'

export type XummQrQuality = 'm' | 'q' | 'h'

export interface XummJsonTransaction extends Record<string, unknown> {
  TransactionType: XummTransactionType | XrplTransactionType
}

export interface XummCustomMeta {
  identifier?: string | null
  blob?: Record<string, unknown> | null
  instruction?: string | null
}

export interface XummPayloadMeta {
  exists: boolean
  uuid: string
  multisign: boolean
  submit: boolean
  pathfinding: boolean
  pathfinding_fallback: boolean
  force_network?: string
  destination: string
  resolved_destination: string
  resolved: boolean
  signed: boolean
  cancelled: boolean
  expired: boolean
  pushed: boolean
  app_opened: boolean
  opened_by_deeplink: boolean | null
  immutable?: boolean
  forceAccount?: boolean
  return_url_app: string | null
  return_url_web: string | null
  is_xapp: boolean
  signers: string[] | null
}

export interface XummPayloadBodyBase {
  options?: {
    submit?: boolean
    pathfinding?: boolean
    pathfinding_fallback?: boolean
    multisign?: boolean
    expire?: number
    signers?: string[]
    force_network?: string
    return_url?: {
      app?: string
      web?: string
    }
  }
  custom_meta?: XummCustomMeta
  user_token?: string
}

export interface XummPostPayloadBodyJson extends XummPayloadBodyBase {
  txjson: XummJsonTransaction
}

export interface XummPostPayloadBodyBlob extends XummPayloadBodyBase {
  txblob: string
}

export type CreatePayload = XummPostPayloadBodyJson | XummPostPayloadBodyBlob

export interface XummPostPayloadResponse {
  uuid: string
  next: {
    always: string
    no_push_msg_received?: string
  }
  refs: {
    qr_png: string
    qr_matrix: string
    qr_uri_quality_opts: XummQrQuality[],
    websocket_status: string
  }
  pushed: boolean
}

export interface XummGetPayloadResponse {
  meta: XummPayloadMeta
  application: {
    name: string
    description: string
    disabled: 0 | 1
    uuidv4: string
    icon_url: string
    issued_user_token: string | null
  }
  payload: {
    tx_type: XummTransactionType | XrplTransactionType
    tx_destination: string
    tx_destination_tag: number | null
    request_json: XummJsonTransaction
    origintype: string | null
    signmethod: string | null
    created_at: string
    expires_at: string
    expires_in_seconds: number
    computed?: Record<string, unknown>
  }
  response: {
    signer_pubkey?: string
    hex: string | null
    txid: string | null
    resolved_at: string | null
    dispatched_nodetype: string | null
    dispatched_to: string | null
    dispatched_result: string | null
    dispatched_to_node: boolean | null
    environment_nodeuri: string | null
    environment_nodetype: string | null
    environment_networkid: number | null
    multisign_account: string | null
    account: string | null
    signer: string | null
    approved_with?: XummTransactionApprovalType
    user: string | null
  }
  custom_meta: XummCustomMeta
}

export interface XummDeletePayloadResponse {
  result: {
    cancelled: boolean
    reason: XummCancelReason
  }
  meta: XummPayloadMeta
  custom_meta: XummCustomMeta
}

export interface XummWebhookBody {
  meta: {
    url: string
    application_uuidv4: string
    payload_uuidv4: string
    opened_by_deeplink: boolean
  }
  custom_meta: XummCustomMeta
  payloadResponse: {
    payload_uuidv4: string
    reference_call_uuidv4: string
    signed: boolean
    user_token: boolean
    return_url: {
      app: string | null
      web: string | null
    }
    txid: string
  }
  userToken: {
    user_token: string
    token_issued: number
    token_expiration: number
  } | null
}

export interface XummWebsocketBody {
  payload_uuidv4: string
  reference_call_uuidv4: string
  signed: boolean
  user_token: boolean
  return_url: {
    app: string | null
    web: string | null
  }
  custom_meta: XummCustomMeta
  txid: string
}

export interface XummApiError {
  error: {
    reference: string
    code: number
  }
}
