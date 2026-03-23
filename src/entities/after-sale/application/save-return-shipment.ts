import type { AfterSaleRepository } from '../domain/after-sale-repository'
import type { SaveReturnShipmentCommand } from '../domain/after-sale'

export async function saveAfterSaleReturnShipment(
  repository: AfterSaleRepository,
  command: SaveReturnShipmentCommand,
) {
  return repository.saveReturnShipment(command)
}
