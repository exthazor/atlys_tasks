import { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { Type, Static } from '@sinclair/typebox';
import prisma from '../../../../loaders/prisma';

// Define the expected shape of the query parameters
const QuerystringSchema = Type.Object({
  page: Type.Optional(Type.Number()),
  pageSize: Type.Optional(Type.Number()),
});

type Querystring = Static<typeof QuerystringSchema>;

interface Follow {
  following_id: string;
}

type GetUserFeedRequest = FastifyRequest<{
  Querystring: Querystring;
}>;

const getUserFeedSchema = {
  schema: {
    querystring: QuerystringSchema
  },
};

const getUserFeedHandler = async (req: GetUserFeedRequest, reply: FastifyReply) => {
  const currentUserId = req.user.id;
  const page = parseInt(req.query.page?.toString() ?? '1');
  const pageSize = parseInt(req.query.pageSize?.toString() ?? '10');
  const skip = (page - 1) * pageSize;

  try {
    const follows = await prisma.follow.findMany({
      where: { follower_id: currentUserId },
      select: { following_id: true },
    });

    const followedUserIds = follows.map((follow: Follow) => follow.following_id);

    const posts = await prisma.post.findMany({
      where: {
        author_id: { in: followedUserIds },
        deleted_at: null,
        published_at: { lte: new Date() },
        visibility: { not: 'private' },
      },
      orderBy: { published_at: 'desc' },
      skip,
      take: pageSize,
    });

    reply.send({ posts, page, pageSize });
  } catch (error) {
    reply.status(500).send({ error: 'An error occurred while fetching the feed.' });
  }
};

export function registerGetUserFeedRoute(fastify: FastifyInstance) {
  fastify.get('/api/v1/posts/feed', { schema: getUserFeedSchema.schema }, getUserFeedHandler as any);
}
