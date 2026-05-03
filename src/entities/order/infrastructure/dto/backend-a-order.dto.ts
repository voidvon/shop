export interface BackendAMerchantSimpleDto {
  id: number
  logo: string | null
  name: string
  short_name: string | null
}

export interface BackendAOrderRefundRequestPayloadDto {
  audit_remark?: string | null
  created_at?: string | null
  id: number
  merchant_id: number
  order_id: number
  reason: string
  refund_no?: string | null
  reviewed_at?: string | null
  reviewed_by?: number | null
  status: number
  status_text?: string | null
  updated_at?: string | null
  user_id: number
}

export interface BackendAOrderItemDto {
  id: number
  image: string | null
  price: string
  product_id: number
  product_sku_id: number
  product_title: string
  quantity: number
  sku_name: string
  total_amount: string
}

export interface BackendAOrderDto {
  address?: string | BackendAOrderAddressDto | null
  address_info?: string | BackendAOrderAddressDto | null
  balance_type_id: number
  city?: string | null
  consignee_name?: string | null
  coupon_amount: string
  created_at?: string | null
  delivery_status: number
  delivery_status_text?: string | null
  district?: string | null
  id: number
  item_count: number
  items: BackendAOrderItemDto[]
  latest_refund_request?: BackendAOrderRefundRequestPayloadDto | null
  merchant?: BackendAMerchantSimpleDto
  merchant_id: number
  mobile?: string | null
  order_no: string
  paid_amount: string
  paid_at: string | null
  payable_amount: string
  payment_status: number
  phone?: string | null
  province?: string | null
  remark: string | null
  refund_no?: string | null
  refunded_at?: string | null
  shipped_at?: string | null
  shipping_company?: string | null
  status: number
  status_text?: string | null
  street?: string | null
  submit_no: string | null
  total_amount: string
  tracking_no?: string | null
  shipping_remark?: string | null
  virtual_delivery_info?: string | null
  updated_at?: string | null
  user_address?: string | BackendAOrderAddressDto | null
  user_coupon_id: number | null
  user_id: number
}

export interface BackendAOrderAddressDto {
  address?: string | null
  city?: string | null
  consignee_name?: string | null
  district?: string | null
  full_address?: string | null
  mobile?: string | null
  phone?: string | null
  province?: string | null
  recipient_name?: string | null
  recipient_phone?: string | null
  receiver_name?: string | null
  receiver_phone?: string | null
  street?: string | null
}

export interface BackendAOrderCollectionDto {
  current_page: number
  data: BackendAOrderDto[]
  per_page: number
  total: number
}

export interface BackendAApiResponseDto<T> {
  code: number
  data: T
  message: string
}

export interface BackendACheckoutPreviewItemDto {
  cart_item_id: number
  line_total: string
  price: string
  product_id: number
  product_sku_id: number
  product_title: string
  quantity: number
  sku_name: string
}

export interface BackendACheckoutBalanceDeductionDto {
  available_amount: string
  balance_type_id: number
  balance_type_name: string
  deduct_amount: string
}

export interface BackendACheckoutPreviewGroupDto {
  available_balance: string
  balance_deductions?: BackendACheckoutBalanceDeductionDto[] | null
  balance_type_id: number
  balance_type_name: string
  coupon_amount: string
  coupon_error: string | null
  coupon_name: string | null
  items: BackendACheckoutPreviewItemDto[]
  merchant_id: number
  merchant_name: string
  payable_amount: string
  total_amount: string
  user_coupon_id: number | null
}

export interface BackendACheckoutPreviewDto {
  groups: BackendACheckoutPreviewGroupDto[]
  order_count: number
  payable_amount: string
  total_amount: string
}
