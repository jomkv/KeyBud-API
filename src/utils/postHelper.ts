import { IUserDocument, IUserPayload } from "../@types/userType";
import PostLike from "../models/PostLike";
import Comment from "../models/Comment";
import { IPostWithProps } from "../@types/postsType";

// * Helper function to check if a post is liked by user from req.kbUser
const isPostLiked = async (
  postId: string,
  user: IUserDocument | undefined // from req.kbUser
): Promise<boolean> => {
  if (user) {
    const like = await PostLike.findOne({ user: user.id, post: postId });

    if (like) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

/**
 * Returns the given post with additional properties: isLiked, likeCount, commentCount
 *
 * @param {any} postDocument - MongoDB Document for Post.
 * @param {IUserPayload | undefined} user - The user payload from JWT.
 */
const getPostProperties = async (
  postDocument: any,
  user: IUserDocument | undefined
): Promise<IPostWithProps> => {
  const post: IPostWithProps = postDocument.toObject();

  const isLiked: boolean = await isPostLiked(post._id, user);
  const likeCount: number = await PostLike.find({ post }).countDocuments();
  const commentCount: number = await Comment.find({
    repliesTo: post._id,
  }).countDocuments();

  post.isLiked = isLiked;
  post.likeCount = likeCount;
  post.commentCount = commentCount;
  return post;
};

/**
 * Returns the given posts with additional properties: isLiked, likeCount, commentCount
 *
 * @param {any[]} posts - MongoDB Documents (array) for Post.
 * @param {IUserPayload | undefined} user - The user payload from JWT.
 */
const getMultiplePostProperties = async (
  posts: any[],
  user: IUserDocument | undefined
): Promise<IPostWithProps[]> => {
  if (posts.length === 0) {
    return posts;
  }

  const postPayload: IPostWithProps[] = await Promise.all(
    posts.map(async (post) => {
      return await getPostProperties(post, user);
    })
  );

  return postPayload;
};

export { getPostProperties, getMultiplePostProperties };
