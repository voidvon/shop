# 用户设置模块

## 对应页面

- `http://www.whhmk.cn/m/tmpl/member/member_account.html`

## 页面结构

- 顶部标题“用户设置”
- 账号设置列表
- 公共信息列表
- 安全退出按钮

## 账号设置项

- 登录密码
  - 状态文案：修改登录密码
- 用户昵称
  - 状态文案：修改用户昵称
- 手机号码
  - 默认状态：未绑定
  - 已绑定状态：显示手机号
- 支付密码
  - 默认状态：设置支付密码
  - 未设置状态：未设置
- 收货地址
  - 状态文案：设置收货地址

## 公共信息项

- 用户反馈
- 关于我们

## 该页可见的下级页面入口

- `member_password_step1.html`
- `member_truename.html`
- `member_mobile_bind.html`
- `member_mobile_modify.html`
- `member_paypwd_step1.html`
- `address_list.html`
- `member_feedback.html`
- `member_about.html`

## 交互说明（基于页面）

- 未登录访问会跳转登录页
- 手机号码项会根据绑定状态跳转不同页面
- 支付密码项会根据是否设置展示不同文案
- 点击各设置项进入对应编辑页
- 点击“安全退出”执行退出登录

