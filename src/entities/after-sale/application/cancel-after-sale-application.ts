import type { AfterSaleRepository } from '../domain/after-sale-repository'

export async function cancelAfterSaleApplication(
  repository: AfterSaleRepository,
  refundId: string,
) {
  return repository.cancelApplication(refundId)
}
