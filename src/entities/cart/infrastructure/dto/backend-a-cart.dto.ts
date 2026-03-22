export interface BackendACartLineDto {
  qty: number
  imageUrl?: string | null
  sku: string
  title: string
  unitAmount: number
}

export interface BackendACartSnapshotDto {
  entries: BackendACartLineDto[]
  payableAmount: number
  totalUnits: number
}
