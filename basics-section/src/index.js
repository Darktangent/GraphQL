import {GraphQLServer} from 'graphql-yoga';

// type definition
// app schema
const typeDefs=`
  type Query{
    me:User! 
    post:Post!
  }
  type Post{
    id:ID!
    title:String! 
    body:String! 
    published:Boolean

  }
  type User{
    id: ID!
    name: String!
    email:String! 
    age:Int
  }
`

//resolvers
const resolvers={
  Query:{
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