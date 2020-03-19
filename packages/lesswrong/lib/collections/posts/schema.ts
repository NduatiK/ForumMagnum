import Users from '../users/collection';
import { Utils, getCollection } from '../../vulcan-lib';
import moment from 'moment';
import { foreignKeyField, resolverOnlyField, denormalizedField, denormalizedCountOfReferences } from '../../utils/schemaUtils'
import { schemaDefaultValue } from '../../collectionUtils';
import { PostRelations } from "../postRelations/collection"

const formGroups = {
  // TODO - Figure out why properly moving this from custom_fields to schema was producing weird errors and then fix it
  adminOptions: {
    name: "adminOptions",
    order: 25,
    label: "Admin Options",
    startCollapsed: true,
  },
  visibleOptions: {
    name: "visibleOptions",
    order: 30,
    defaultStyle: true,
  }
};

const schema = {
  // Timestamp of post creation
  createdAt: {
    type: Date,
    optional: true,
    viewableBy: ['admins'],
    onInsert: () => new Date(),
  },
  // Timestamp of post first appearing on the site (i.e. being approved)
  postedAt: {
    type: Date,
    optional: true,
    viewableBy: ['guests'],
    insertableBy: ['admins'],
    editableBy: ['admins'],
    control: 'datetime',
    group: formGroups.adminOptions,
    onInsert: (post, currentUser) => {
      // Set the post's postedAt if it's going to be approved
      if (!post.postedAt && getCollection('Posts').getDefaultStatus(currentUser) === getCollection('Posts').config.STATUS_APPROVED) {
        return new Date();
      }
    },
    onEdit: (modifier, post) => {
      // Set the post's postedAt if it's going to be approved
      if (!post.postedAt && modifier.$set.status === getCollection('Posts').config.STATUS_APPROVED) {
        return new Date();
      }
    }
  },
  // Timestamp of last post modification
  modifiedAt: {
    type: Date,
    optional: true,
    viewableBy: ['guests'],
    ...denormalizedField({
      getValue: () => {
        return new Date()
      }
    }),
  },
  // URL
  url: {
    type: String,
    optional: true,
    max: 500,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: [Users.owns, 'sunshineRegiment', 'admins'],
    control: 'url',
    order: 10,
    query: `
      SiteData{
        logoUrl
        title
      }
    `,
  },
  // Title
  title: {
    type: String,
    optional: false,
    max: 500,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: [Users.owns, 'sunshineRegiment', 'admins'],
    control: 'text',
    order: 20,
  },
  // Slug
  slug: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
    onInsert: (post) => {
      return Utils.getUnusedSlugByCollectionName("Posts", Utils.slugify(post.title))
    },
    onEdit: (modifier, post) => {
      if (modifier.$set.title) {
        return Utils.getUnusedSlugByCollectionName("Posts", Utils.slugify(modifier.$set.title), false, post._id)
      }
    }
  },
  // Post Excerpt
  excerpt: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
  },
  // Count of how many times the post's page was viewed
  viewCount: {
    type: Number,
    optional: true,
    viewableBy: ['admins'],
    defaultValue: 0
  },
  // Timestamp of the last comment
  lastCommentedAt: {
    type: Date,
    denormalized: true,
    optional: true,
    viewableBy: ['guests'],
  },
  // Count of how many times the post's link was clicked
  clickCount: {
    type: Number,
    optional: true,
    viewableBy: ['admins'],
    defaultValue: 0
  },

  deletedDraft: {
    type: Boolean,
    optional: true,
    ...schemaDefaultValue(false),
    viewableBy: ['guests'],
    editableBy: ['members'],
    hidden: true,
  },

  // The post's status. One of pending (`1`), approved (`2`), rejected (`3`), spam (`4`) or deleted (`5`)
  status: {
    type: Number,
    optional: true,
    viewableBy: ['guests'],
    insertableBy: ['admins'],
    editableBy: ['admins'],
    control: 'select',
    onInsert: (document, currentUser) => {
      if (!document.status) {
        return getCollection('Posts').getDefaultStatus(currentUser);
      }
    },
    onEdit: (modifier, document, currentUser) => {
      // if for some reason post status has been removed, give it default status
      if (modifier.$unset && modifier.$unset.status) {
        return getCollection('Posts').getDefaultStatus(currentUser);
      }
    },
    options: () => getCollection('Posts').statuses,
    group: formGroups.adminOptions
  },
  // Whether a post is scheduled in the future or not
  isFuture: {
    type: Boolean,
    optional: true,
    viewableBy: ['guests'],
    onInsert: (post) => {
      // Set the post's isFuture to true if necessary
      if (post.postedAt) {
        const postTime = new Date(post.postedAt).getTime();
        const currentTime = new Date().getTime() + 1000;
        return postTime > currentTime; // round up to the second
      } else {
        return false;
      }
    },
    onEdit: (modifier, post) => {
      // Set the post's isFuture to true if necessary
      if (modifier.$set.postedAt) {
        const postTime = new Date(modifier.$set.postedAt).getTime();
        const currentTime = new Date().getTime() + 1000;
        if (postTime > currentTime) {
          // if a post's postedAt date is in the future, set isFuture to true
          return true;
        } else if (post.isFuture) {
          // else if a post has isFuture to true but its date is in the past, set isFuture to false
          return false;
        }
      }
    }
  },
  // Whether the post is sticky (pinned to the top of posts lists)
  sticky: {
    type: Boolean,
    optional: true,
    ...schemaDefaultValue(false),
    viewableBy: ['guests'],
    insertableBy: ['admins'],
    editableBy: ['admins'],
    control: 'checkbox',
    group: formGroups.adminOptions,
    onInsert: (post) => {
      if(!post.sticky) {
        return false;
      }
    },
    onEdit: (modifier, post) => {
      if (!modifier.$set.sticky) {
        return false;
      }
    }
  },
  // Save info for later spam checking on a post. We will use this for the akismet package
  userIP: {
    type: String,
    optional: true,
    viewableBy: ['admins'],
  },
  userAgent: {
    type: String,
    optional: true,
    viewableBy: ['admins'],
  },
  referrer: {
    type: String,
    optional: true,
    viewableBy: ['admins'],
  },
  // The post author's name
  author: {
    type: String,
    denormalized: true,
    optional: true,
    viewableBy: ['guests'],
    onEdit: (modifier, document, currentUser) => {
      // if userId is changing, change the author name too
      if (modifier.$set && modifier.$set.userId) {
        return Users.getDisplayNameById(modifier.$set.userId)
      }
    }
  },
  // The post author's `_id`.
  userId: {
    ...foreignKeyField({
      idFieldName: "userId",
      resolverName: "user",
      collectionName: "Users",
      type: "User"
    }),
    optional: true,
    control: 'select',
    viewableBy: ['guests'],
    insertableBy: ['members'],
    hidden: true,
  },

  // Used to keep track of when a post has been included in a newsletter
  scheduledAt: {
    type: Date,
    optional: true,
    viewableBy: ['admins'],
  },

  // GraphQL-only fields

  domain: resolverOnlyField({
    type: String,
    viewableBy: ['guests'],
    resolver: (post, args, context) => Utils.getDomain(post.url),
  }),

  pageUrl: resolverOnlyField({
    type: String,
    viewableBy: ['guests'],
    resolver: (post, args, {Posts}) => Posts.getPageUrl(post, true),
  }),
  
  pageUrlRelative: resolverOnlyField({
    type: String,
    viewableBy: ['guests'],
    resolver: (post, args, {Posts}) => Posts.getPageUrl(post, false),
  }),

  linkUrl: resolverOnlyField({
    type: String,
    viewableBy: ['guests'],
    resolver: (post, args, { Posts }) => {
      return post.url ? Utils.getOutgoingUrl(post.url) : Posts.getPageUrl(post, true);
    },
  }),

  postedAtFormatted: resolverOnlyField({
    type: String,
    viewableBy: ['guests'],
    resolver: (post, args, context) => {
      return moment(post.postedAt).format('dddd, MMMM Do YYYY');
    }
  }),

  emailShareUrl: resolverOnlyField({
    type: String,
    viewableBy: ['guests'],
    resolver: (post, args, { Posts }) => Posts.getEmailShareUrl(post),
  }),

  twitterShareUrl: resolverOnlyField({
    type: String,
    viewableBy: ['guests'],
    resolver: (post, args, { Posts }) => Posts.getTwitterShareUrl(post),
  }),

  facebookShareUrl: resolverOnlyField({
    type: String,
    viewableBy: ['guests'],
    resolver: (post, args, { Posts }) => Posts.getFacebookShareUrl(post),
  }),

  question: {
    type: Boolean,
    optional: true,
    ...schemaDefaultValue(false),
    viewableBy: ['guests'],
    insertableBy: ['members'],
    hidden: true,
  },

  authorIsUnreviewed: {
    type: Boolean,
    optional: true,
    denormalized: true,
    ...schemaDefaultValue(false),
    viewableBy: ['guests'],
    insertableBy: ['admins', 'sunshineRegiment'],
    editableBy: ['admins', 'sunshineRegiment'],
    group: formGroups.adminOptions,
  },
  
  // DEPRECATED field for GreaterWrong backwards compatibility
  wordCount: resolverOnlyField({
    type: Number,
    viewableBy: ['guests'],
    resolver: (post, args, { Posts }) => {
      const contents = post.contents;
      if (!contents) return 0;
      return contents.wordCount;
    }
  }),
  // DEPRECATED field for GreaterWrong backwards compatibility
  htmlBody: resolverOnlyField({
    type: String,
    viewableBy: ['guests'],
    resolver: (post, args, { Posts }) => {
      const contents = post.contents;
      if (!contents) return "";
      return contents.html;
    }
  }),

  submitToFrontpage: {
    type: Boolean,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: [Users.owns, 'admins', 'sunshineRegiment'],
    optional: true,
    hidden: true,
    ...schemaDefaultValue(true),
    onCreate: ({newDocument}) => {
      if (newDocument.isEvent) return false
      if ('submitToFrontpage' in newDocument) return newDocument.submitToFrontpage
      return true
    },
    onUpdate: ({data, document}) => {
      const updatedDocIsEvent = ('isEvent' in document) ? document.isEvent : false
      if (updatedDocIsEvent) return false
      return ('submitToFrontpage' in document) ? document.submitToFrontpage : true
    }
  },

  hiddenRelatedQuestion: {
    type: Boolean,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: [Users.owns, 'admins', 'sunshineRegiment'],
    hidden: true,
    optional: true,
    ...schemaDefaultValue(false),
  },

  originalPostRelationSourceId: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    hidden: true,
  },

  sourcePostRelations: resolverOnlyField({
    type: Array,
    graphQLtype: '[PostRelation!]',
    viewableBy: ['guests'],
    resolver: async (post, args, { Posts }) => {
      return await PostRelations.find({targetPostId: post._id}).fetch()
    }
  }),
  'sourcePostRelations.$': {
    type: String,
    optional: true,
  },

  targetPostRelations: resolverOnlyField({
    type: Array,
    graphQLtype: '[PostRelation!]',
    viewableBy: ['guests'],
    resolver: async (post, args, { Posts }) => {
      const postRelations = await Posts.rawCollection().aggregate([
        { $match: { _id: post._id }},
        { $graphLookup: { 
            from: "postrelations", 
            as: "relatedQuestions", 
            startWith: post._id, 
            connectFromField: "targetPostId", 
            connectToField: "sourcePostId", 
            maxDepth: 3 
          } 
        },
        { 
          $project: {
            relatedQuestions: 1
          }
        }, 
        {
          $unwind: "$relatedQuestions"
        }, 
        {
          $replaceRoot: {
            newRoot: "$relatedQuestions"
          }
        }
     ]).toArray()
     if (!postRelations || postRelations.length < 1) return []
     return postRelations
    }
  }),
  'targetPostRelations.$': {
    type: String,
    optional: true,
  },
  
  // A post should have the shortform flag set iff its author's shortformFeedId
  // field is set to this post's ID.
  shortform: {
    type: Boolean,
    optional: true,
    hidden: true,
    viewableBy: ['guests'],
    insertableBy: ['admins'],
    editableBy: ['admins'],
    denormalized: true,
    ...schemaDefaultValue(false),
  },

  canonicalSource: {
    type: String,
    optional: true,
    hidden: true,
    viewableBy: ['guests'],
    insertableBy: ['admins'],
    editableBy: ['admins'],
  },

  nominationCount2018: {
    ...denormalizedCountOfReferences({
      fieldName: "nominationCount2018",
      collectionName: "Posts",
      foreignCollectionName: "Comments",
      foreignTypeName: "comment",
      foreignFieldName: "postId",
      filterFn: comment => !comment.deleted && comment.nominatedForReview === "2018"
    }),
    canRead: ['guests'],
  },

  reviewCount2018: {
    ...denormalizedCountOfReferences({
      fieldName: "reviewCount2018",
      collectionName: "Posts",
      foreignCollectionName: "Comments",
      foreignTypeName: "comment",
      foreignFieldName: "postId",
      filterFn: comment => !comment.deleted && comment.reviewingForReview === "2018"
    }),
    canRead: ['guests'],
  },
  
  // Denormalized, with manual callbacks. Mapping from tag ID to baseScore, ie Record<string,number>.
  tagRelevance: {
    type: Object,
    optional: true,
    hidden: true,
    viewableBy: ['guests'],
  },
  
  "tagRelevance.$": {
    type: Number,
    optional: true,
    hidden: true,
  },
};

export default schema;