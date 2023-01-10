import { ApolloCache, NormalizedCacheObject } from '@apollo/client';
import {
  getPublicationTypename,
  PublicationStats,
  ReactionTypes,
} from '@lens-protocol/api-bindings';
import { ReactionType } from '@lens-protocol/domain/entities';
import {
  ReactionRequest,
  IReactionPresenter,
  ReactionError,
} from '@lens-protocol/domain/use-cases/publications';
import { Deferred, Result } from '@lens-protocol/shared-kernel';

export class ReactionPresenter implements IReactionPresenter {
  constructor(private cache: ApolloCache<NormalizedCacheObject>) {}

  private deferredResult = new Deferred<Result<void, ReactionError>>();

  present(result: Result<void, ReactionError>): void {
    this.deferredResult.resolve(result);
  }

  asResult(): Promise<Result<void, ReactionError>> {
    return this.deferredResult.promise;
  }

  async presentOptimisticAdd(request: ReactionRequest): Promise<void> {
    await this.addReaction(request);
  }

  async presentOptimisticRemove(request: ReactionRequest): Promise<void> {
    await this.removeReaction(request);
  }

  async revertOptimisticAdd(request: ReactionRequest): Promise<void> {
    await this.removeReaction(request);
  }

  async revertOptimisticRemove(request: ReactionRequest): Promise<void> {
    await this.addReaction(request);
  }

  private async addReaction(request: ReactionRequest): Promise<void> {
    switch (request.reactionType) {
      case ReactionType.UPVOTE:
        {
          const id = this.cache.identify({
            __typename: getPublicationTypename(request.publicationType),
            id: request.publicationId,
          });

          this.cache.modify({
            id,
            fields: {
              stats(oldStats: PublicationStats) {
                return {
                  ...oldStats,
                  totalUpvotes: oldStats.totalUpvotes + 1,
                };
              },
              reaction: () => ReactionTypes.Upvote,
            },
          });
        }
        break;

      case ReactionType.DOWNVOTE:
        throw new Error('Downvotes support not implemented');
      default:
        throw new Error('Unknown reaction type');
    }
  }

  private async removeReaction(request: ReactionRequest): Promise<void> {
    switch (request.reactionType) {
      case ReactionType.UPVOTE:
        {
          const id = this.cache.identify({
            __typename: getPublicationTypename(request.publicationType),
            id: request.publicationId,
          });

          this.cache.modify({
            id,
            fields: {
              stats(oldStats: PublicationStats) {
                return {
                  ...oldStats,
                  totalUpvotes: oldStats.totalUpvotes - 1,
                };
              },
              reaction: () => null,
            },
          });
        }
        break;

      case ReactionType.DOWNVOTE:
        throw new Error('Downvotes support not implemented');
      default:
        throw new Error('Unknown reaction type');
    }
  }
}