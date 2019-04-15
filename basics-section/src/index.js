import {GraphQLServer} from 'graphql-yoga';
import { text } from 'body-parser';

//user data
const users=[{
  id:'1',name:"Rohan", email:"rohan@example.com",age:32
},
{
  id:'2',name:"Ron", email:"ron@example.com",age:29
},
{
  id:'3',name:"Rey", email:"rey@example.com",age:49
}
]
const posts=[{id:'1',title:"my trip to moscow",body:"trip details",published:true,author:"1"},
{id:'2',title:"my trip to maryland",body:"maryland trip details",published:false,author:"2"},
{id:'3',title:"my trip to new york",body:"new yorktrip details",published:true,author:"3"}
]
const comments=[{id:'1',text:"Awesome post. Thanks",author:"1",post:"1"},
{id:'2',text:"Nice post. Thanks",author:"2",post:"1"},
{id:'3',text:"Good post. Thanks",author:"3",post:"2"},
{id:'4',text:"Thanks for the feedback",author:"1",post:"3"},
]
// type definition
// app schema
const typeDefs=`
  type Query{
    users(query:String):[User!]!
    posts(query:String):[Post!]!
    comments(query:String):[Comment!]!
    me:User! 
    post:Post!
  }
  type Post{
    id:ID!
    title:String! 
    body:String! 
    published:Boolean!
    author: User!
    comments:[Comment!]!

  }
  type User{
    id: ID!
    name: String!
    email:String! 
    age:Int
    posts:[Post!]!
    comments:[Comment!]!
  }
  type Comment{
    id:ID! 
    text: String!
    author:User!
    post:Post!
  }
`

//resolvers
const resolvers={

  Comment:{
    author(parent,args,ctx,info){
      return users.find(user=>{
        return user.id===parent.author
      })
    },
    post(parent,args,ctx,info){
      return posts.find(post=>{
        return post.id===parent.post
      })
    }
  },
  User:{
    posts(parent,args,ctx,info){
      return posts.find((post)=>{
        return post.author===parent.id
      })
    },
    comments(parent,args,ctx,info){
      return comments.filter((comment)=>{
        return comment.author===parent.id
      })
    }
  },
  Post:{
    author(parent,args,ctx,info){
      return users.find((user)=>{
        return user.id===parent.author
      })
    },
    comments(parent,args,ctx,info){
      return comments.filter((comment)=>{
        return comment.post===parent.id
      })
    }
  },
  Query:{
    comments(parent,args,ctx,info){
      if(!args.query){
        return comments
      }
      return comments.filter((comment)=>{
        return args.query===comment.id
      })
    },
    posts(parent,args,ctx,info){
      if(!args.query){
        return posts
      }
      return posts.filter((post)=> {
        const isBodyMatch= post.body.toLowerCase().includes(args.query.toLowerCase())
        const isTitleMatch= post.title.toLowerCase().includes(args.query.toLowerCase())
        return isTitleMatch || isBodyMatch
      })
      
    },
    users(parent,args,ctx,info){
      if(!args.query){
        return users
      }
      return users.filter((user)=>{
        return user.name.toLowerCase().includes(args.query.toLowerCase())
      })
    },
    me(){
      return {id:"123098",name:"Rohan",email:"rohanganguly@icloud.com",age:29}

    },
    post(){
      return {id:"ABC123", title:"A Story of ...", body:"This is the body", published:true}
    }
  }
}
const server= new GraphQLServer({
  typeDefs:typeDefs,
  resolvers:resolvers
})
server.start(()=>{
  console.log("The server is up")
})