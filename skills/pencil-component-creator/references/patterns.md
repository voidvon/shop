# Pencil Component Patterns

## Read This File When

- 需要创建新的 Pencil 组件源
- 需要把普通节点替换成真实 `ref`
- 需要验证“到底是不是复用”
- 需要为实例覆写名称、金额、原价、显隐

## Pattern 1: Create A True Reusable Source

```javascript
comp=I(document,{type:"frame",name:"Component/Product/Card",reusable:true,x:-400,y:1200,width:171,height:220,fill:"#FFFFFF",cornerRadius:12,layout:"vertical",gap:8,padding:[0,0,8,0]})
img=I(comp,{type:"frame",name:"productImage",width:"fill_container",height:140,fill:"#EDECEA",cornerRadius:8})
nameWrap=I(comp,{type:"frame",name:"nameWrapper",width:"fill_container",padding:[0,8]})
nameText=I(nameWrap,{type:"text",name:"productName",content:"商品名称",fill:"#1A1918",textGrowth:"fixed-width",width:"fill_container",fontFamily:"Inter",fontSize:14,fontWeight:"500"})
info=I(comp,{type:"frame",name:"productInfo",width:"fill_container",gap:8,padding:[0,8],alignItems:"center"})
price=I(info,{type:"text",name:"productPrice",content:"¥99.00",fill:"#D08068",fontFamily:"Inter",fontSize:16,fontWeight:"600"})
original=I(info,{type:"text",name:"originalPrice",content:"¥129.00",fill:"#9C9B99",fontFamily:"Inter",fontSize:13,fontWeight:"normal"})
```

## Pattern 2: Insert A Real Instance

```javascript
item=I("home__zQHdl",{type:"ref",ref:"TQrkL",width:"fill_container",descendants:{
  "wtitn":{content:"神经酰胺修护精华"},
  "zJcpN":{content:"¥189"},
  "adUN0":{content:"¥229.00"}
}})
```

## Pattern 3: Hide Original Price In One Instance

```javascript
item=I("category__pLCjh",{type:"ref",ref:"TQrkL",width:"fill_container",descendants:{
  "wtitn":{content:"积雪草舒缓面霜"},
  "zJcpN":{content:"¥129"},
  "adUN0":{enabled:false}
}})
```

## Pattern 4: Verify True Reuse

目标不是“看起来像”，而是读出来像这样：

```json
{
  "id": "8G4ci",
  "type": "ref",
  "ref": "TQrkL",
  "descendants": {
    "zJcpN": { "content": "¥99.00" }
  }
}
```

## Anti-Patterns

- 复制一个普通 `frame` 到别处，然后把它当成公共组件。
- 只看截图或节点名称，就宣称“已经复用”。
- 在每个实例上重复覆写圆角、字号、padding、stroke，最后把共享组件改成假共享。
- 修改多个 screen 时忘记加 `placeholder:true`。
- 插入临时 probe/test 节点后忘记清理。
