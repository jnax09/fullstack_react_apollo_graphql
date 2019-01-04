import mongoose from 'mongoose'
import {
    combineResolvers
} from 'graphql-resolvers'
import {
    AuthenticationError,
    UserInputError
} from 'apollo-server';

import {
    isAdmin
} from './authorization'

export default {
    Query: {
        me: async (parent, args, {
            models,
            me
        }) => {
            if (!me) return null;
            try {
                return await models.User.findById(me.id)
            } catch (error) {
                throw new Error(error.message)
            }
        },
        user: async (parent, {
            id
        }, {
            models
        }) => {
            try {
                return await models.User.findById(id)
            } catch (error) {
                throw new Error(error.message)
            }
        },
        userByUsername: async (parent, {
            username
        }, {
            models
        }) => {
            try {
                return await models.User.findOne({
                    username
                })
            } catch (error) {
                throw new Error(error.message)
            }
        },
        users: async (parent, args, {
            models
        }) => {
            try {
                return await models.User.find({})
            } catch (error) {
                throw new Error(error.message)
            }
        },
    },
    Mutation: {
        signUp: async (parent, {
            username,
            email,
            role,
            password
        }, {
            models,
            secret
        }) => {
            const user = new models.User({
                username,
                email,
                password,
                role
            })

            try {
                await user.save()
                return {
                    token: user.generateToken(secret, '30m')
                }
            } catch (error) {
                throw new Error(error.message)
            }
        },
        signIn: async (parent, {
            login,
            password
        }, {
            models,
            secret
        }) => {
            const user = await models.User.findByLogin(login)

            if (!user) {
                throw new UserInputError('No user found with this login credentials.')
            }

            const isValid = user.validatePassword(password)

            if (!isValid) {
                throw new AuthenticationError('Invalid Password.')
            }

            return {
                token: user.generateToken(secret, '30m')
            }
        },
        deleteUser: combineResolvers(isAdmin, async (parent, {
            id
        }, {
            models
        }) => {
            try {
                await models.User.findOneAndDelete({
                    id
                })
                return true
            } catch (error) {
                throw new Error(error.message)
                return false
            }
        })
    },
    User: {
        messages: async (user, args, {
            models
        }) => {
            try {
                return await models.Message.find({
                    user: user.id
                })
            } catch (error) {
                throw new Error(error.message)
            }
        }
    }
}