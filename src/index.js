require ('dotenv').config()

import express from 'express'
import http from 'http';
import { ApolloServer, AuthenticationError } from 'apollo-server-express'
import cors from 'cors'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import DataLoader from 'dataloader';

import schema from './schema';
import resolvers from './resolvers';
import models from './models';

import seedData from './seedData'
import loaders from './loaders';

const app = express()

app.use(cors())

//Connect to database
const database = process.env.TEST_DATABASE || process.env.DATABASE
const isTest = !!process.env.TEST_DATABASE;

mongoose
    .connect(
        `mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@ds143604.mlab.com:43604/${database}`, { useNewUrlParser: true }, () => {
            console.log('Connected to MongoDB...')
            if(isTest) seedData()
        })
 
        
//Verify incoming token before the request hits the graphql resolvers
const getMe = async req => {
    const token = req.headers['x-token']

    if (token) {
        try {
            return await jwt.verify(token, process.env.SECRET)
        } catch (error) {
            throw new AuthenticationError('Your session expired. Sign in again.')
        }
    }
}

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: async ({ req, connection }) => {
        if (connection) {
            return {
                models,
                loaders: {
                    user: new DataLoader(keys => loaders.user.batchUsers(keys,models))
                }
            };
        }
    
        if (req) {
            const me = await getMe(req);
    
            return {
                models,
                me,
                secret: process.env.SECRET,
                loaders: {
                    user: new DataLoader(keys => loaders.user.batchUsers(keys,models))
                }
            };
        }
    },
})

server.applyMiddleware({ app, path: '/graphql' })

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql')
})