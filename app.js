const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')
let app = express()

let forumData = [
    {id: "1", title: "Title 1", desc: "Yeyyy ini desc", userId: "2"},
    {id: "2", title: "Title 2", desc: "Ini keduaa :(", userId: "1"},
    {id: "3", title: "Title 3", desc: "Forum dengan id 3", userId: "1"}
]
let userData = [
    {id: "1", name: "RdFariz"},
    {id: "2", name: "Aiss"}
]

let schema = buildSchema(`
    type Forum {
        id: ID,
        title: String,
        desc: String,
        user: User
    }
    type User {
        id: ID,
        name: String,
        forums: [Forum]
    }

    type Query {
        forum(id: ID!): Forum,
        forums: [Forum],
        user(id: ID!): User,
        users: [User]
    }

    type Mutation {
        addUser(id: ID!, name: String!): User,
        addForum(id: ID!, title: String!, desc: String!, userId: ID!): Forum,
        delUser(id: ID!): User,
        delForum(id: ID!): Forum
    }
`)

// .find(untuk 1 data) & .filter(untuk plural/ > 1 data)
let resolvers = {
    forum: (args)=> {
        let _forum = forumData.find(el => el.id == args.id)
        let _user = userData.find(el => el.id == _forum.id)
        _forum['user'] = _user

        return _forum
    },
    forums: ()=> {
        let _forums = forumData
        let _users = userData
        _forums.forEach(element => {
            element.user = _users.find(el => el.id == element.userId)
        });

        return _forums
    },
    user: (args)=>{
        let _user = userData.find(el => el.id == args.id)
        let _forum = forumData.filter(el => el.userId == _user.id)
        _user['forums'] = _forum

        return _user
    },
    users: ()=> {
        let _user = userData
        let _forum = forumData
        
        // # Cara 1
        // _user.forEach(element => {
        //     let forum = _forum.filter(el => el.userId == element.id)
        //     element.forums = forum
        // })
        
        // # Cara 2
        _user.map((eachUser)=>{
            let forum = _forum.filter(el => el.userId == eachUser.id)
            eachUser['forums'] = forum
        })

        return _user
    },
    addUser: ({id, name}) => {
        let _newUser = {id: id, name: name}
        userData.push(_newUser)

        return _newUser
    },
    addForum: ({id, title, desc, userId}) => {
        let _newForum = {id: id, title: title, desc: desc, userId, userId}
        forumData.push(_newForum)

        return _newForum
    },
    delUser: ({id})=> {
        userData.splice(userData.findIndex(el=>el.id == id), 1)
        return userData
    },
    delForum: ({id})=> {
        forumData.splice(forumData.findIndex(el => el.id == id), 1)
        return forumData
    }
}

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: true //GUI
}))


app.listen(4000, ()=>console.log('Server is running...'))