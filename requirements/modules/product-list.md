# 商品列表页

## 功能

- 排序：综合/销量/价格
- 筛选：价格区间、地区、商品类型、店铺类型
- 列表/宫格切换
- 滚动加载

## 列表展示字段（基于页面）

- `goods_id`
- `goods_image_url`
- `goods_name`
- `goods_price`
- `goods_marketprice`
- `store_name`
- `is_own_shop`
- `is_virtual`
- `is_presell`
- `is_fcode`
- `have_gift`
- `group_flag`
- `xianshi_flag`

## 主要筛选参数

- `keyword`, `gc_id`, `b_id`
- `area_id`, `price_from`, `price_to`
- `own_shop`, `gift`, `groupbuy`, `xianshi`, `virtual`
- `order`, `key`, `curpage`, `page`

## 交互说明（基于页面）

- 点击综合/销量/价格切换排序
- 点击筛选打开侧滑筛选层
- 筛选项支持多选与价格区间
- 列表/宫格切换按钮
- 列表滚动触发加载更多
