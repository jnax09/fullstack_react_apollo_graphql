//Data Loader for batching and catching
export const batchUsers = async (keys, models) => {
    const users = await models.User.find({
        _id: {
            $in: keys
        }
    })

    return keys.map(key => users.find(user => user._id === key));
};


export const batchedUserFetching = async (keys, models) => {
    const foundUsers = []

    for (const key of keys) {
        let user = await models.User.findOne({
            _id: key
        })
        foundUsers.push(user)
    }

    return foundUsers

}