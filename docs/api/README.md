# 后端 API 文档

## 1. 文档来源

- Swagger 页面：`http://123.207.4.226:8080/api/documentation`
- OpenAPI JSON：`http://123.207.4.226:8080/docs?api-docs.json`
- 最近一次抓取时间：`2026-04-11`
- 原始文件：[`openapi.json`](/root/shop/docs/api/openapi.json)

说明：

- Swagger UI 实际加载的是 `http://123.207.4.226:8080/docs?api-docs.json`
- 当前导出格式为 `OpenAPI 3.0.0`
- 文档 `servers[0].url` 为 `/`，前端接入时仍应以项目环境变量中的后端基地址为准

## 1.1 文档索引

- 原始 OpenAPI：[`openapi.json`](/root/shop/docs/api/openapi.json)
- 接口明细索引：[`endpoints.md`](/root/shop/docs/api/endpoints.md)
- 前端接入现状：[`frontend-integration-status.md`](/root/shop/docs/api/frontend-integration-status.md)
- 商家首页开发清单：[`store-home-integration-tasks.md`](/root/shop/docs/api/store-home-integration-tasks.md)

## 2. 总览

| 项 | 数量 |
| --- | ---: |
| Path 数 | 39 |
| Operation 数 | 46 |
| Tag 数 | 17 |
| 公开接口 | 13 |
| 需鉴权接口 | 33 |

后端文档信息：

- 标题：`微信 H5 商城系统 API`
- 版本：`1.0.0`
- 描述：`微信 H5 商城系统前端接口文档（V1），商户核销员使用普通微信用户 Token，通过商户员工关系拥有核销权限`

## 3. 鉴权说明

- 安全方案：`sanctum`
- 类型：`http bearer`
- 文档描述：`Laravel Sanctum Bearer Token`
- 公开接口主要集中在登录、首页、分类、商品、平台配置、合作商家、员工邀请查看
- 购物车、结算、订单、余额、储值卡、优惠券、地址、客服、上传、线下付款等接口均要求 Bearer Token

## 4. 接口分组总览

### 用户认证

- `POST /api/v1/auth/wechat` 微信公众号静默授权登录（后端按 `code -> openid` 自动登录或注册）
- `GET /api/v1/auth/profile` 获取当前用户资料；已绑定商户员工时，响应 `data` 中会额外返回 `merchant` 对象，前端读取其中的 `merchant.id`
- `PATCH /api/v1/auth/profile` 更新当前用户资料
- `GET /api/v1/user-addresses` 地址列表
- `POST /api/v1/user-addresses` 新增地址
- `DELETE /api/v1/user-addresses/{userAddress}` 删除地址
- `PATCH /api/v1/user-addresses/{userAddress}` 更新地址

### 微信

- `GET /api/v1/wechat/jssdk-signature` 获取微信公众号 JSSDK 签名参数

### 员工邀请

- `GET /api/v1/merchant-staff-invites/{token}` 查看商户员工邀请链接信息
- `POST /api/v1/merchant-staff-invites/{token}/bind` 当前微信用户通过邀请链接绑定为商户员工

### 平台

- `GET /api/v1/platform/settings` 获取平台基础信息

### 首页

- `GET /api/v1/home` 首页聚合接口

### 分类

- `GET /api/v1/product-categories` 获取商品分类列表和树

### 合作商家

- `GET /api/v1/partner-regions` 合作地区列表
- `GET /api/v1/partner-store-types` 合作门店类型列表
- `GET /api/v1/partner-merchants` 合作商家列表
- `GET /api/v1/partner-merchants/{partnerMerchant}` 合作商家详情

### 商品

- `GET /api/v1/products` 商品列表
- `GET /api/v1/products/{product}` 商品详情

### 购物车

- `GET /api/v1/cart-items` 购物车列表
- `POST /api/v1/cart-items` 加入购物车
- `DELETE /api/v1/cart-items/{cartItem}` 删除购物车项
- `PATCH /api/v1/cart-items/{cartItem}` 更新购物车项

### 结算

- `POST /api/v1/checkout/preview` 预结算
- `POST /api/v1/checkout/submit` 提交订单

### 订单

- `GET /api/v1/orders` 订单列表
- `GET /api/v1/orders/{order}` 订单详情

### 余额

- `GET /api/v1/balance-accounts` 余额账户列表
- `GET /api/v1/balance-accounts/logs` 余额流水

### 储值卡

- `POST /api/v1/stored-value-cards/recharge` 绑定储值卡并转入线上余额
- `POST /api/v1/stored-value-cards/lookup` 根据储值卡号和卡密查询储值卡信息
- `GET /api/v1/stored-value-cards/recharge-logs` 获取当前用户历史储值记录
- `GET /api/v1/stored-value-cards/{storedValueCard}/qr` 获取储值卡二维码文本内容

### 优惠券

- `GET /api/v1/coupons` 我的优惠券
- `GET /api/v1/merchant-coupons` 商家可领取优惠券列表
- `POST /api/v1/coupons/{couponTemplate}/claim` 领取优惠券

### 客服

- `GET /api/v1/customer-service/conversations` 客服会话列表
- `POST /api/v1/customer-service/conversations` 创建客服留言会话
- `GET /api/v1/customer-service/unread-summary` 客服未读汇总
- `GET /api/v1/customer-service/conversations/{customerServiceConversation}` 客服会话详情
- `GET /api/v1/customer-service/conversations/{customerServiceConversation}/messages` 客服消息列表
- `POST /api/v1/customer-service/conversations/{customerServiceConversation}/messages` 用户追加客服留言
- `GET /api/v1/customer-service/conversations/{customerServiceConversation}/increment` 增量拉取客服消息

### 线下付款

- `GET /api/v1/offline-payments/payment-code` 获取用户付款码
- `POST /api/v1/merchant/offline-payments/scan` 商户核销员扫码识别用户付款码或储值卡二维码
- `POST /api/v1/merchant/offline-payments/pay` 商户核销员提交线下支付

### 上传

- `POST /api/v1/uploads/images` 上传图片

## 5. 项目内使用建议

- 以 [`openapi.json`](/root/shop/docs/api/openapi.json) 作为前端对接、生成类型、补充 DTO 的原始依据
- 以本 README 作为接口范围和分组的快速索引
- 以 [`endpoints.md`](/root/shop/docs/api/endpoints.md) 作为方法、路径、鉴权、参数、请求体和响应模型的速查表
- 以 [`frontend-integration-status.md`](/root/shop/docs/api/frontend-integration-status.md) 作为“当前代码已经接了什么、哪些还没接、哪些与 Swagger 不一致”的对照清单
- 后续如果后端 Swagger 变更，优先重新抓取 `openapi.json`，再同步更新本文件中的统计与分组
- `GET /api/v1/home` 已在本次抓取中更新为 `query:product_limit, category_limit`，响应商品字段改为 `products`
- `2026-04-04` 已补入 `POST /api/v1/stored-value-cards/lookup`、`GET /api/v1/stored-value-cards/recharge-logs`、`GET /api/v1/merchant-coupons`
- `2026-04-10` 已补充 `POST /api/v1/stored-value-cards/recharge` 请求体中的 `mobile` 字段说明
- `2026-04-10` 已补入 `GET /api/v1/wechat/jssdk-signature`，前端传 `url` 查询参数即可获取 `wx.config` 所需签名参数；后端会自动去掉 hash，响应还包含 `url` 与 `rawString` 便于调试
- `2026-04-11` 已补充 `GET /api/v1/auth/profile` 的 `merchant` 字段说明，用于前端识别当前登录用户所属商户

## 5.1 当前项目范围内不接入的接口

以下接口虽然存在于后端 OpenAPI 中，但属于后台/商户侧能力，不在当前会员端 H5 项目范围内：

- 合作商家列表相关
  - `GET /api/v1/partner-regions`
  - `GET /api/v1/partner-store-types`
  - `GET /api/v1/partner-merchants`
- 商户侧扫码核销相关
  - `POST /api/v1/merchant/offline-payments/scan`
  - `POST /api/v1/merchant/offline-payments/pay`
- 商户员工邀请相关
  - `GET /api/v1/merchant-staff-invites/{token}`
  - `POST /api/v1/merchant-staff-invites/{token}/bind`
- 储值卡二维码展示相关
  - `GET /api/v1/stored-value-cards/{storedValueCard}/qr`

说明：

- 当前项目仍会使用 `GET /api/v1/partner-merchants/{partnerMerchant}` 作为店铺详情来源
- 当前项目仍会使用 `POST /api/v1/stored-value-cards/recharge` 处理储值卡绑定充值
- 以上“不接入”仅表示当前前台会员端不实现，不代表后端接口无效

## 6. 刷新方式

可在项目根目录执行：

```bash
curl --max-time 20 -L http://123.207.4.226:8080/docs?api-docs.json -o docs/api/openapi.json
```
