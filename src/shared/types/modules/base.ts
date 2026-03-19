export interface PageQuery {
  page: number
  pageSize: number
}

export interface PageResult<T> {
  list: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export interface CursorPageResult<T> {
  list: T[]
  nextCursor: string | null
  hasMore: boolean
}

export interface AmountDetail {
  code: string
  label: string
  amount: number
  direction: 'increase' | 'decrease'
}

export interface ActionPermission<Action extends string = string> {
  key: Action
  enabled: boolean
  reason: string | null
}

export interface OperationState {
  status: 'idle' | 'pending' | 'success' | 'failed'
  message: string | null
}
