# API 接口明细索引

来源：[`openapi.json`](/root/shop/docs/api/openapi.json)  
抓取时间：`2026-04-30`

说明：

- `鉴权=公开` 表示当前 OpenAPI operation 未声明 `security`
- `鉴权=Bearer` 表示当前 operation 使用 `sanctum` Bearer Token
- `请求体/成功响应=object` 表示文档使用内联对象定义，没有单独命名 schema
- 更细的字段定义请直接查看 [`openapi.json`](/root/shop/docs/api/openapi.json) 中对应 `paths` 与 `components.schemas`

## 储值卡

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | /api/v1/stored-value-cards/recharge | Bearer | - | object | ApiResponse | 绑定储值卡并转入线上余额 |
| POST | /api/v1/stored-value-cards/lookup | Bearer | - | object | object | 根据储值卡号和卡密查询储值卡信息 |
| GET | /api/v1/stored-value-cards/recharge-logs | Bearer | query:per_page | - | object | 获取当前用户历史储值记录 |
| GET | /api/v1/stored-value-cards/{storedValueCard}/qr | Bearer | path:storedValueCard | - | object | 获取储值卡二维码文本内容 |

## 订单

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | /api/v1/orders | Bearer | query:per_page | - | object | 订单列表 |
| GET | /api/v1/orders/{order} | Bearer | path:order | - | object | 订单详情 |
| POST | /api/v1/orders/{order}/receive | Bearer | path:order | - | object | 确认收货 |
| POST | /api/v1/orders/{order}/refund-request | Bearer | path:order | object | object | 申请退单，提交后进入待审核 |

## 分类

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | /api/v1/product-categories | 公开 | - | - | object | 获取商品分类列表和树 |

## 购物车

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | /api/v1/cart-items | Bearer | - | - | object | 购物车列表 |
| POST | /api/v1/cart-items | Bearer | - | object | object | 加入购物车 |
| DELETE | /api/v1/cart-items/{cartItem} | Bearer | path:cartItem | - | object | 删除购物车项 |
| PATCH | /api/v1/cart-items/{cartItem} | Bearer | path:cartItem | object | object | 更新购物车项 |

## 合作商家

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | /api/v1/partner-regions | 公开 | - | - | ApiResponse | 合作地区列表 |
| GET | /api/v1/partner-store-types | 公开 | - | - | ApiResponse | 合作门店类型列表 |
| GET | /api/v1/partner-merchants | 公开 | query:region_id, query:store_type_id, query:keyword, query:per_page | - | ApiResponse | 合作商家列表 |
| GET | /api/v1/partner-merchants/{partnerMerchant} | 公开 | path:partnerMerchant | - | ApiResponse | 合作商家详情 |

## 结算

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | /api/v1/checkout/preview | Bearer | - | object | object | 预结算 |
| POST | /api/v1/checkout/submit | Bearer | - | object | object | 提交订单 |

## 客服

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | /api/v1/customer-service/conversations | Bearer | query:per_page | - | ApiResponse | 客服会话列表 |
| POST | /api/v1/customer-service/conversations | Bearer | - | object | ApiResponse | 创建客服留言会话 |
| GET | /api/v1/customer-service/unread-summary | Bearer | - | - | ApiResponse | 客服未读汇总 |
| GET | /api/v1/customer-service/conversations/{customerServiceConversation} | Bearer | path:customerServiceConversation | - | ApiResponse | 客服会话详情 |
| GET | /api/v1/customer-service/conversations/{customerServiceConversation}/messages | Bearer | path:customerServiceConversation, query:per_page | - | ApiResponse | 客服消息列表 |
| POST | /api/v1/customer-service/conversations/{customerServiceConversation}/messages | Bearer | path:customerServiceConversation | object | ApiResponse | 用户追加客服留言 |
| GET | /api/v1/customer-service/conversations/{customerServiceConversation}/increment | Bearer | path:customerServiceConversation, query:after_id, query:limit | - | ApiResponse | 增量拉取客服消息 |

## 平台

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | /api/v1/platform/settings | 公开 | - | - | object | 获取平台基础信息 |

## 商品

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | /api/v1/products | 公开 | query:merchant_id, query:category_id, query:keyword, query:sort_by, query:sort_dir, query:min_price, query:max_price, query:per_page | - | object | 商品列表 |
| GET | /api/v1/products/{product} | 公开 | path:product | - | object | 商品详情 |

## 上传

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | /api/v1/uploads/images | Bearer | - | object | ApiResponse | 上传图片 |

## 首页

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | /api/v1/home | 公开 | query:product_limit, query:category_limit | - | object | 首页聚合接口 |

## 线下付款

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | /api/v1/offline-payments/payment-code | Bearer | - | - | ApiResponse | 获取用户付款码 |
| GET | /api/v1/merchant/offline-payments | Bearer | query:min_amount, query:max_amount, query:start_time, query:end_time, query:per_page | - | MerchantOfflinePaymentLogResponse | 合作商家员工查看当前所属商家的线下支付流水 |
| POST | /api/v1/merchant/offline-payments/scan | Bearer | - | object | ApiResponse | 合作商家核销员扫码识别用户付款码或储值卡二维码 |
| POST | /api/v1/merchant/offline-payments/pay | Bearer | - | object | ApiResponse | 合作商家核销员提交线下支付；前端应带 `balance_type_id`，来源为 `GET /api/v1/auth/profile -> data.merchant.supported_balance_types` |
| POST | /api/v1/merchant/offline-payments/{offlinePayment}/refund | Bearer | path:offlinePayment | - | MerchantOfflinePaymentRefundResponse | 合作商家核销员发起线下付款退款 |

## 用户认证

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | /api/v1/auth/wechat | 公开 | - | WechatLoginRequest | WechatLoginResponse | 微信公众号静默授权登录 |
| GET | /api/v1/auth/profile | Bearer | - | - | object | 获取当前用户资料（已绑定商户员工时返回 `merchant` 对象，包含 `id` 与 `supported_balance_types`） |
| PATCH | /api/v1/auth/profile | Bearer | - | object | object | 更新当前用户资料 |
| GET | /api/v1/user-addresses | Bearer | - | - | ApiResponse | 地址列表 |
| POST | /api/v1/user-addresses | Bearer | - | object | object | 新增地址 |
| DELETE | /api/v1/user-addresses/{userAddress} | Bearer | path:userAddress | - | ApiResponse | 删除地址 |
| PATCH | /api/v1/user-addresses/{userAddress} | Bearer | path:userAddress | object | object | 更新地址 |

## 微信

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | /api/v1/wechat/jssdk-signature | 公开 | query:url | - | WechatJssdkSignPackageResponse | 获取微信公众号 JSSDK 签名参数 |

## 优惠券

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | /api/v1/coupons | Bearer | query:per_page | - | object | 我的优惠券 |
| GET | /api/v1/merchant-coupons | 公开 | query:merchant_id | - | object | 商家可领取优惠券列表 |
| POST | /api/v1/coupons/{couponTemplate}/claim | Bearer | path:couponTemplate | - | ApiResponse | 领取优惠券 |

## 余额

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | /api/v1/balance-accounts | Bearer | - | - | object | 余额账户列表 |
| GET | /api/v1/balance-accounts/logs | Bearer | query:per_page | - | BalanceAccountLogResponse | 余额流水 |

## 员工邀请

| 方法 | 路径 | 鉴权 | 参数 | 请求体 | 成功响应 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | /api/v1/merchant-staff-invites/{token} | 公开 | path:token | - | ApiResponse | 查看商户员工邀请链接信息 |
| POST | /api/v1/merchant-staff-invites/{token}/bind | Bearer | path:token | - | ApiResponse | 当前微信用户通过邀请链接绑定为商户员工 |
