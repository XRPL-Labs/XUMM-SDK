export interface PossibleKycStatuses {
  NONE: string
  IN_PROGRESS: string
  REJECTED: string
  SUCCESSFUL: string
}

export interface KycStatusResponse {
  kycStatus: keyof PossibleKycStatuses
  possibleStatuses: PossibleKycStatuses
}
