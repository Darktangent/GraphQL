import { GraphQLServer } from 'graphql-yoga';
import { text } from 'body-parser';
import uuidv4 from 'uuid/v4';

//user data
let users = [
	{
		id: '1',
		name: 'Rohan',
		email: 'rohan@example.com',
		age: 32
	},
	{
		id: '2',
		name: 'Ron',
		email: 'ron@example.com',
		age: 29
	},
	{
		id: '3',
		name: 'Rey',
		email: 'rey@example.com',
		age: 49
	}
];
let posts = [
	{
		id: '1',
		title: 'my trip to moscow',
		body: 'trip details',
		published: true,
		author: '1'
	},
	{
		id: '2',
		title: 'my trip to maryland',
		body: 'maryland trip details',
		published: true,
		author: '2'
	},
	{
		id: '3',
		title: 'my trip to new york',
		body: 'new yorktrip details',
		published: true,
		author: '3'
	}
];
let comments = [
	{ id: '1', text: 'Awesome post. Thanks', author: '1', post: '1' },
	{ id: '2', text: 'Nice post. Thanks', author: '2', post: '1' },
	{ id: '3', text: 'Good post. Thanks', author: '3', post: '2' },
	{ id: '4', text: 'Thanks for the feedback', author: '1', post: '3' }
];
// type definition
// app schema
const typeDefs = `
  type Query{
    users(query:String):[User!]!
    posts(query:String):[Post!]!
    comments(query:String):[Comment!]!
    me:User! 
    post:Post!
  }
  type Mutation{
    createUser( data: CreateUserInput): User!
    deleteUser(id: ID!):User!
    deletePost(id:ID!):Post!
    deleteComment(id:ID!):Comment!
    createPost(data: CreatePostInput):Post!
    createComment(data:CreateCommentInput):Comment!
  }
  input CreateCommentInput{
    text:String!
    author:ID!
    post:ID!
  }
  input CreatePostInput{
    title:String!
    body:String! 
    published:Boolean!
    author:ID!
  }
  input CreateUserInput {
    name:String!
     email:String!
      age:Int
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
`;

//resolvers
const resolvers = {
	Comment: {
		author(parent, args, ctx, info) {
			return users.find(user => {
				return user.id === parent.author;
			});
		},
		post(parent, args, ctx, info) {
			return posts.find(post => {
				return post.id === parent.post;
			});
		}
	},
	User: {
		posts(parent, args, ctx, info) {
			return posts.find(post => {
				return post.author === parent.id;
			});
		},
		comments(parent, args, ctx, info) {
			return comments.filter(comment => {
				return comment.author === parent.id;
			});
		}
	},
	Post: {
		author(parent, args, ctx, info) {
			return users.find(user => {
				return user.id === parent.author;
			});
		},
		comments(parent, args, ctx, info) {
			return comments.filter(comment => {
				return comment.post === parent.id;
			});
		}
	},
	Query: {
		comments(parent, args, ctx, info) {
			if (!args.query) {
				return comments;
			}
			return comments.filter(comment => {
				return args.query === comment.id;
			});
		},
		posts(parent, args, ctx, info) {
			if (!args.query) {
				return posts;
			}
			return posts.filter(post => {
				const isBodyMatch = post.body
					.toLowerCase()
					.includes(args.query.toLowerCase());
				const isTitleMatch = post.title
					.toLowerCase()
					.includes(args.query.toLowerCase());
				return isTitleMatch || isBodyMatch;
			});
		},
		users(parent, args, ctx, info) {
			if (!args.query) {
				return users;
			}
			return users.filter(user => {
				return user.name.toLowerCase().includes(args.query.toLowerCase());
			});
		},
		me() {
			return {
				id: '123098',
				name: 'Rohan',
				email: 'rohanganguly@icloud.com',
				age: 29
			};
		},
		post() {
			return {
				id: 'ABC123',
				title: 'A Story of ...',
				body: 'This is the body',
				published: true
			};
		}
	},
	Mutation: {
		createUser(parent, args, ctx, info) {
			const emailTaken = users.some(user => {
				return user.email === args.data.email;
			});
			if (emailTaken) {
				throw new Error('Email Taken.');
			}

			const user = {
				id: uuidv4(),
				...args.data
				// name: args.name,
				// email: args.email,
				// age: args.age
			};
			users.push(user);
			return user;
		},
		deletePost(parent, args, ctx, info) {
			const postIndex = posts.findIndex(post => {
				return post.id === args.id;
			});
			if (postIndex === -1) {
				throw new Error('Post not found');
			}
			const deletedPost = posts.splice(postIndex, 1);
			comments = comments.filter(comment => {
				return comment.post !== args.id;
			});
			return deletedPost[0];
		},
		deleteComment(parent, args, ctx) {
			const commentIndex = comments.findIndex(comment => {
				return comment.id === args.id;
			});
			if (commentIndex === -1) {
				throw new Error('Comment Not found');
			}
			const deletedComment = comments.splice(commentIndex, 1);
			return deletedComment[0];
		},
		deleteUser(parent, args, ctx, info) {
			const userIndex = users.findIndex(user => {
				return user.id === args.id;
			});
			if (userIndex === -1) {
				throw new Error('Not found');
			}
			const deletedUsers = users.splice(userIndex, 1);
			posts = posts.filter(post => {
				const match = post.author === args.id;
				if (match) {
					comments = comments.filter(comment => {
						return comment.post !== post.id;
					});
				}
				return !match;
			});
			comments = comments.filter(comment => {
				return comment.author !== args.id;
			});
			return deletedUsers[0];
		},
		createPost(parent, args, ctx, info) {
			const userExists = users.some(user => {
				return user.id === args.data.author;
			});
			if (!userExists) {
				throw new Error('User not found');
			}
			const post = {
				id: uuidv4(),
				...args.data
				// title: args.title,
				// body: args.body,
				// published: args.published,
				// author: args.author
			};
			posts.push(post);
			return post;
		},
		createComment(parent, args, ctx, info) {
			const userExists = users.some(user => {
				return user.id === args.data.author;
			});
			if (!userExists) {
				throw new Error('No user found');
			}
			const postExists = posts.some(post => {
				return posts.id === args.data.post || post.published === true;
			});
			// const postPublished = posts.filter(post => {
			// 	return post.published === true;
			// });
			if (!postExists) {
				throw new Error('post does not exist or not published ');
			}
			const comment = {
				id: uuidv4(),
				// text: args.text,
				// author: args.author,
				// post: args.post
				...args.data
			};
			comments.push(comment);
			return comment;
		}
	}
};
const server = new GraphQLServer({
	typeDefs: typeDefs,
	resolvers: resolvers
});
server.start(() => {
	console.log('The server is up');
});
