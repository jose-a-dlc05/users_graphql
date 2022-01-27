const graphql = require('graphql');
const axios = require('axios');

const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLSchema,
	GraphQLList,
	GraphQLNonNull,
} = graphql;

const url = 'http://localhost:3000';

// Define CompanyType
const CompanyType = new GraphQLObjectType({
	name: 'Company',
	fields: () => ({
		id: { type: GraphQLString },
		name: { type: GraphQLString },
		description: { type: GraphQLString },
		users: {
			type: new GraphQLList(UserType),
			resolve(parentVal, args) {
				return axios
					.get(`${url}/companies/${parentVal.id}/users`)
					.then((res) => res.data);
			},
		},
	}),
});

const UserType = new GraphQLObjectType({
	name: 'User',
	fields: () => ({
		id: { type: GraphQLString },
		firstName: { type: GraphQLString },
		age: { type: GraphQLInt },
		company: {
			type: CompanyType,
			resolve(parentVal, args) {
				return axios
					.get(`${url}/companies/${parentVal.companyId}`)
					.then((res) => res.data);
			},
		},
	}),
});

const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		user: {
			type: UserType,
			args: { id: { type: GraphQLString } },
			// The resolve function is where we go to look into the database/data store
			resolve(parentValue, args) {
				return axios.get(`${url}/users/${args.id}`).then((resp) => resp.data);
			},
		},
		company: {
			type: CompanyType,
			args: { id: { type: GraphQLString } },
			resolve(parentVal, args) {
				return axios
					.get(`${url}/companies/${args.id}`)
					.then((resp) => resp.data);
			},
		},
	},
});

const mutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		addUser: {
			type: UserType,
			args: {
				firstName: { type: new GraphQLNonNull(GraphQLString) },
				age: { type: new GraphQLNonNull(GraphQLInt) },
				companyId: { type: GraphQLString },
			},
			resolve(parentVal, { firstName, age }) {
				return axios
					.post(`${url}/users`, { firstName, age })
					.then((res) => res.data);
			},
		},
		deleteUser: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLString) },
			},
			resolve(parentVal, { id }) {
				return axios.delete(`${url}/users/${id}`).then((res) => res.data);
			},
		},
		editUser: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLString) },
				firstName: { type: GraphQLString },
				age: { type: GraphQLInt },
			},
			resolve(parentVal, { id, firstName, age }) {
				return axios
					.patch(`${url}/users/${id}`, { firstName, age })
					.then((res) => res.data);
			},
		},
	},
});

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation,
});
