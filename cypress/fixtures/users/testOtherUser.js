module.exports = {
    _id: "test-other-user",
    username: "test-other-user",
    slug: "test-other-user",
    displayName: "Test Other User",
    email: "test-other-user@testingaltrusim.org",
    isAdmin: false,
    reviewedByUserId: "test-admin",
    needsReview: false,
    emails: [ 
        {
            address: "test-other-user@testingaltruism.org",
            verified: true,
        },
    ],
    usernameUnset: false,
    /** code below not relevant to any existing test as of
     * 2021-10-15, but added for dev-prod parity.
     **/
    createdAt: new Date(),
    lastNotificationsCheck: new Date(),
    auto_subscribe_to_my_posts: true,
    auto_subscribe_to_my_comments: true,
    autoSubscribeAsOrganizer: true,
    notificationCommentsOnSubscribedPost: {
        channel: "onsite",
        batchingFrequency: "realtime",
        timeOfDayGMT: 12,
        dayOfWeekGMT: "Monday",
    },
    notificationShortformContent: {
        channel: "onsite",
        batchingFrequency: "realtime",
        timeOfDayGMT: 12,
        dayOfWeekGMT: "Monday",
    },
    notificationRepliesToMyComments: {
        channel: "onsite",
        batchingFrequency: "realtime",
        timeOfDayGMT: 12,
        dayOfWeekGMT: "Monday",
    },
    notificationRepliesToSubscribedComments: {
        channel: "onsite",
        batchingFrequency: "realtime",
        timeOfDayGMT: 12,
        dayOfWeekGMT: "Monday",
    },
    notificationSubscribedUserPost: {
        channel: "onsite",
        batchingFrequency: "realtime",
        timeOfDayGMT: 12,
        dayOfWeekGMT: "Monday",
    },
    notificationPostsInGroups: {
        channel: "both",
        batchingFrequency: "realtime",
        timeOfDayGMT: 12,
        dayOfWeekGMT: "Monday",
    },
    notificationSubscribedTagPost: {
        channel: "onsite",
        batchingFrequency: "realtime",
        timeOfDayGMT: 12,
        dayOfWeekGMT: "Monday",
    },
    notificationPrivateMessage: {
        channel: "both",
        batchingFrequency: "realtime",
        timeOfDayGMT: 12,
        dayOfWeekGMT: "Monday",
    },
    notificationSharedWithMe: {
        channel: "both",
        batchingFrequency: "realtime",
        timeOfDayGMT: 12,
        dayOfWeekGMT: "Monday",
    },
    notificationAlignmentSubmissionApproved: {
        channel: "both",
        batchingFrequency: "realtime",
        timeOfDayGMT: 12,
        dayOfWeekGMT: "Monday",
    },
    notificationEventInRadius: {
        channel: "both",
        batchingFrequency: "realtime",
        timeOfDayGMT: 12,
        dayOfWeekGMT: "Monday",
    },
    notificationRSVPs: {
        channel: "both",
        batchingFrequency: "realtime",
        timeOfDayGMT: 12,
        dayOfWeekGMT: "Monday",
    },
    karmaChangeNotifierSettings: {
        updateFrequency: "daily",
        timeOfDayGMT: 12,
        dayOfWeekGMT: "Monday",
        showNegativeKarma: false,
    },
    subscribedToDigest: false,
    hideSubscribePoke: false,
    frontpagePostCount: 1,
    nearbyEventsNotifications: false,
    sunshineNotes: "",
    sunshineFlagged: false,
    sunshineSnoozed: false,
    maxPostCount: 1,
    maxCommentCount: 0,
    schemaVersion: 1,
    afCommentCount: 0,
    commentCount: 0,
}