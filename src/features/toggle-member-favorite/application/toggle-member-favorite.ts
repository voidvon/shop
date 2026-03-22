import {
  hasMemberFavorite,
  removeMemberFavorite,
  saveMemberFavorite,
  type MemberFavoriteItem,
  type MemberFavoriteRepository,
} from '@/entities/member-favorite'

export interface ToggleMemberFavoriteCommand extends MemberFavoriteItem {
  userId: string
}

export interface ToggleMemberFavoriteResult {
  isFavorited: boolean
  successMessage: string
}

export async function toggleMemberFavorite(
  command: ToggleMemberFavoriteCommand,
  repository: MemberFavoriteRepository,
): Promise<ToggleMemberFavoriteResult> {
  const alreadyFavorited = await hasMemberFavorite(repository, command.userId, command.productId)

  if (alreadyFavorited) {
    await removeMemberFavorite(repository, command.userId, command.productId)

    return {
      isFavorited: false,
      successMessage: '已取消收藏',
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
    successMessage: '已收藏商品',
  }
}
