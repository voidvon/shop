# 总览与思维导图

范围：移动端、无登录（不含购物车/下单/会员/消息）。

```mermaid
mindmap
  root((泉州文惠卡-移动端-无登录))
    Goals
      文化商品展示与导购
      分类与搜索发现
      专区活动导流
    Pages
      首页
      分类入口页
      分类列表页
      商品列表页
      商品详情
      商品详情-内容
      商品评价列表
      搜索
      门店区域
      专题页
    Flows
      分类浏览
      搜索
      详情查看
    Features
      Banner轮播
      分类导航
      列表滚动加载
      搜索热词与历史
      TabBar(TBD)
    Vue3 Scope
      Routes
      Components
      State
      API Layer
```

来源页面与脚本（截至 2026-03-17）：
- `/m/index.html`
- `/m/tmpl/category_all.html?gc_id=2` + `/zplugs/web/m_category_all.js`
- `/m/tmpl/product_detail.html?goods_id=142184` + `/m/js/tmpl/product_detail.js`
- `/m/tmpl/product_info.html?goods_id=142184` + `/m/js/tmpl/product_info.js`
- `/m/tmpl/product_eval_list.html?goods_id=142184` + `/m/js/tmpl/product_eval_list.js`
- `/m/tmpl/product_first_categroy.html` + `/m/js/tmpl/categroy-frist-list.js`
- `/m/tmpl/product_list.html?gc_id=2`
- `/m/tmpl/search.html`
- `/m/tmpl/store_area.html`
- `/m/special.html?special_id=23`

