import {
  hasMemberFavorite,
  saveMemberFavorite,
  type MemberFavoriteItem,
  type MemberFavoriteRepository,
} from '@/entities/member-favorite'

export interface EnsureMemberFavoriteCommand extends MemberFavoriteItem {
  userId: string
}

export interface EnsureMemberFavoriteResult {
  isFavorited: boolean
  successMessage: string | null
}

export async function ensureMemberFavorite(
  command: EnsureMemberFavoriteCommand,
  repository: MemberFavoriteRepository,
): Promise<EnsureMemberFavoriteResult> {
  const alreadyFavorited = await hasMemberFavorite(repository, command.userId, command.productId)

  if (alreadyFavorited) {
    return {
      isFavorited: true,
      successMessage: null,
    }
  }

  await saveMemberFavorite(repository, command.userId, {
    productId: command.productId,
    productImageUrl: command.productImageUrl,
    productName: command.productName,
    productPrice: command.productPrice,
    storeName: command.storeName,
  })

  return {
    isFavorited: true,
    successMessage: '已自动收藏商品',
  }
}
