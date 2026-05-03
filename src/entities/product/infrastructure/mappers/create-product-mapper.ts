import type { ProductAttribute, ProductDetail, ProductSummary } from '../../domain/product'

type FieldResolver<TSource, TValue> = keyof TSource | ((source: TSource) => TValue)

export interface ProductSummaryFieldMap<TSource> {
  balanceTypeCode?: FieldResolver<TSource, string | null>
  balanceTypeId?: FieldResolver<TSource, string | null>
  balanceTypeName?: FieldResolver<TSource, string | null>
  category: FieldResolver<TSource, string>
  categoryId: FieldResolver<TSource, string>
  coverImageUrl?: FieldResolver<TSource, string | null>
  id: FieldResolver<TSource, string>
  inventory: FieldResolver<TSource, number>
  monthlySales: FieldResolver<TSource, number>
  name: FieldResolver<TSource, string>
  price: FieldResolver<TSource, number>
  subtitle?: FieldResolver<TSource, string | null>
  summary: FieldResolver<TSource, string>
  tags: FieldResolver<TSource, string[]>
}

export interface ProductDetailFieldMap<TSource> extends ProductSummaryFieldMap<TSource> {
  attributes: FieldResolver<TSource, ProductAttribute[]>
  detailDescription: FieldResolver<TSource, string>
  gallery: FieldResolver<TSource, string[]>
  sellingPoints: FieldResolver<TSource, string[]>
  serviceLabels: FieldResolver<TSource, string[]>
}

function resolveField<TSource, TValue>(
  source: TSource,
  resolver: FieldResolver<TSource, TValue>,
): TValue {
  if (typeof resolver === 'function') {
    return resolver(source)
  }

  return source[resolver] as TValue
}

function cloneTextList(values: string[]) {
  return [...values]
}

function cloneAttributes(values: ProductAttribute[]) {
  return values.map((attribute) => ({ ...attribute }))
}

export function createProductSummaryMapper<TSource>(fieldMap: ProductSummaryFieldMap<TSource>) {
  return (source: TSource): ProductSummary => ({
    balanceTypeCode: fieldMap.balanceTypeCode ? resolveField(source, fieldMap.balanceTypeCode) : null,
    balanceTypeId: fieldMap.balanceTypeId ? resolveField(source, fieldMap.balanceTypeId) : null,
    balanceTypeName: fieldMap.balanceTypeName ? resolveField(source, fieldMap.balanceTypeName) : null,
    category: resolveField(source, fieldMap.category),
    categoryId: resolveField(source, fieldMap.categoryId),
    coverImageUrl: fieldMap.coverImageUrl ? resolveField(source, fieldMap.coverImageUrl) : null,
    id: resolveField(source, fieldMap.id),
    inventory: resolveField(source, fieldMap.inventory),
    monthlySales: resolveField(source, fieldMap.monthlySales),
    name: resolveField(source, fieldMap.name),
    price: resolveField(source, fieldMap.price),
    subtitle: fieldMap.subtitle ? resolveField(source, fieldMap.subtitle) : null,
    summary: resolveField(source, fieldMap.summary),
    tags: cloneTextList(resolveField(source, fieldMap.tags)),
  })
}

export function createProductDetailMapper<TSource>(fieldMap: ProductDetailFieldMap<TSource>) {
  const mapSummary = createProductSummaryMapper(fieldMap)

  return (source: TSource): ProductDetail => ({
    ...mapSummary(source),
    attributes: cloneAttributes(resolveField(source, fieldMap.attributes)),
    detailDescription: resolveField(source, fieldMap.detailDescription),
    gallery: cloneTextList(resolveField(source, fieldMap.gallery)),
    sellingPoints: cloneTextList(resolveField(source, fieldMap.sellingPoints)),
    serviceLabels: cloneTextList(resolveField(source, fieldMap.serviceLabels)),
  })
}
