import mongoose from 'mongoose'
import models from './models'

export default async () => {
    // if (Object.keys(models.User).length !== 0 ) {
    //     return;
    // }

    const date = new Date()

    //User 0
    let user0 = new models.User({
        id: 1,
        username: 'rwieruch',
        email: 'hello@robin.com',
        role: 'ADMIN',
        password: 'rwieruch',
    })
    let message0 = new models.Message({
        text: 'Published the Road to Learn React',
        user: user0._id,    
        createdAt: date.setSeconds(date.getSeconds() + 1) 
    })

    try {
        await user0.save() 
        message0 = await message0.save()

        user0.messages.push(message0._id)
        
        await user0.save()
        console.log("User 1 data saved...")
    } catch (error) {
        console.log(error.message)
    }
    
    //User 1
    let user1 = new models.User({
        id: 2,
        username: 'ddavids',
        email: 'bye@davs.com',
        password: 'ddavids',
    })
    let message1 = new models.Message({
        text: 'Long way to freedom',
        user: user1._id,
        createdAt: date.setSeconds(date.getSeconds() + 1) 
    })

    try {
        await user1.save() 
        message1 = await message1.save()

        user1.messages.push(message1._id)
        
        await user1.save()
        console.log("User 2 data saved...")
    } catch (error) {
        console.log(error.message)
    }
  };