import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Type, Static } from '@sinclair/typebox';
import prisma from '../../../../loaders/prisma';

const querySchema = Type.Object({
  page: Type.Number({ default: 1 }),
  pageSize: Type.Number({ default: 10 }),
});
type QuerystringType = Static<typeof querySchema>;

interface GetUserFeedRequest extends FastifyRequest<{ Querystring: QuerystringType }> {}

interface FollowType {
  following_id: string;
}

async function getUserFeedHandler(req: GetUserFeedRequest, reply: FastifyReply) {
  const currentUserId = req.user.id;
  const { page, pageSize } = req.query;

  const skip = (page - 1) * pageSize;

  try {
    const follows = await prisma.follow.findMany({
      where: { follower_id: currentUserId },
      select: { following_id: true },
    });

    const followedUserIds = follows.map((follow: FollowType) => follow.following_id);

    const posts = await prisma.post.findMany({
      where: {
        author_id: { in: followedUserIds },
        deleted_at: null,
        published_at: { lte: new Date() },
        visibility: { not: "private" },
      },
      orderBy: { published_at: 'desc' },
      skip,
      take: pageSize,
    });

    reply.send({ posts, page, pageSize });
  } catch (error) {
    reply.status(500).send({ error: 'An error occurred while fetching the feed.' });
  }
}

export function registerGetUserFeedRoute(fastify: FastifyInstance) {
  fastify.get<{
    Querystring: QuerystringType
  }>('/api/v1/posts/feed', {
    schema: {
      querystring: querySchema
    }
  }, getUserFeedHandler);
}
