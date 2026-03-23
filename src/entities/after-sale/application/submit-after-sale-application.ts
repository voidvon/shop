import type { AfterSaleRepository } from '../domain/after-sale-repository'
import type { SubmitAfterSaleApplicationCommand } from '../domain/after-sale'

export async function submitAfterSaleApplication(
  repository: AfterSaleRepository,
  command: SubmitAfterSaleApplicationCommand,
) {
  return repository.submitApplication(command)
}
