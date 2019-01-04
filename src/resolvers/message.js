import {
    combineResolvers
} from 'graphql-resolvers'

import {
    isAuthenticated,
    isMessageOwner
} from './authorization'

import pubsub, {
    EVENTS
} from '../subscriptions'

const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string =>
    Buffer.from(string, 'base64').toString('ascii');

export default {
    Query: {
        messages: async (parent, {
            cursor,
            limit = 2
        }, {
            models
        }) => {
            try {
                let allMessages

                if (!cursor) {
                    allMessages = await models.Message
                        .find({})
                        .limit(limit + 1)
                        .sort("-createdAt")
                } else {
                    allMessages = await models.Message
                        .find({
                            createdAt: {
                                '$lte': fromCursorHash(cursor)
                            }
                        })
                        .limit(limit + 1)
                        .sort("-createdAt")
                }

                const hasNextPage = allMessages.length > limit
                const edges = hasNextPage ? allMessages.slice(0, -1) : allMessages

                return {
                    edges,
                    pageInfo: {
                        hasNextPage,
                        endCursor: toCursorHash(edges[edges.length - 1].createdAt.toString()),
                    },
                }

            } catch (error) {
                throw new Error(error.message)
            }
        },
        message: async (parent, {
            id
        }, {
            models
        }) => {
            try {
                return await models.Message.findById(id)
            } catch (error) {
                throw new Error(error.message)
            }
        }
    },
    Message: {
        user: async (message, args, {
            loaders
        }) => {
            try {
                return await loaders.user.load(message.user)
            } catch (error) {
                throw new Error(error.message)
            }
        }
    },
    Mutation: {
        createMessage: combineResolvers(isAuthenticated, async (parent, {
            text
        }, {
            me,
            models
        }) => {
            let message = new models.Message({
                text,
                user: me.id
            })

            try {
                const user = await models.User.findById(me.id)
                user.messages.push(message)
                await user.save()

                message = await message.save()

                pubsub.publish(EVENTS.MESSAGE.CREATED, {
                    messageCreated: {
                        message
                    }
                })

                return message
            } catch (error) {
                throw new Error(error.message)
            }
        }),
        deleteMessage: combineResolvers(isAuthenticated, isMessageOwner, async (message, {
            id
        }, {
            models
        }) => {
            try {
                await models.Message.findOneAndDelete({
                    id
                })
                return true
            } catch (error) {
                throw new Error(error.message)
                return false
            }
        })
    },
    Subscription: {
        messageCreated: {
            subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED),
        }
    }
}