import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { Query, ApolloConsumer } from "react-apollo";
import gql from "graphql-tag";
import { Provider, Heading, Button, Text, Flex, Box } from "rebass";
import { Slider } from "antd";
import "antd/dist/antd.css";

/*
const client = new ApolloClient({
    uri: "http://localhost:3000/graphql"
});
*/

const client = new ApolloClient({
	//cache: new InMemoryCache(),
	uri: "http://loneyeti.com:3000/graphql/"
});

const marks = {
	0: "All",
	50: "F",
	100: "M"
};

const topMarks = {
	0: "100",
	50: "5000",
	100: "All"
};

function formatter(valueStr) {
	const value = Number(valueStr);
	if (value < 50 && value != 100) {
		return "All";
	}
	if (value === 100) {
		return "M";
	}
	return "F";
}

function topFormatter(valueStr) {
	const value = Number(valueStr);
	if (value === 100) {
		return "All";
	}
	if (value === 0) {
		return "100";
	}
	return `${value * 100}`;
}

class RandomName extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			gender: null,
			top: null,
			refresh: 0,
			firstName: "",
			surname: ""
		};
	}
	render() {
		const query = gql`
			query name($gender: String, $top: Int) {
				name(gender: $gender, top: $top) {
					firstName
					gender
					surname
				}
			}
		`;
		return (
			<Query
				query={query}
				variables={{ gender: this.props.gender, top: this.props.top }}
				fetchPolicy="network-only"
			>
				{({ loading, error, data, refetch }) => {
					if (loading) return <p>Loading...</p>;
					if (error) return <p>Error</p>;
					const name = data.name[0];
					const results = (
						<div>
							<Text
								fontSize={7}
								textAlign="center"
								fontWeight="bold"
								bg="gray"
								p={3}
							>
								{name.firstName} {name.surname}
							</Text>
							<button
								onClick={() => {
									refetch(this.props.refresh());
								}}
							>
								Reload
							</button>
						</div>
					);

					return results;
				}}
			</Query>
		);
	}
}

class GenderSlider extends React.Component {
	render() {
		return (
			<Box width={1 / 2} p={3}>
				<Text>Gender</Text>
				<Slider
					tipFormatter={formatter}
					marks={marks}
					step={null}
					defaultValue={0}
					onChange={value => this.props.onChange(value)}
				/>
			</Box>
		);
	}
}

class TopSlider extends React.Component {
	render() {
		return (
			<Box width={1 / 2} p={3}>
				<Text>Top</Text>
				<Slider
					defaultValue={100}
					marks={topMarks}
					tipFormatter={topFormatter}
					onChange={value => this.props.onChange(value)}
				/>
			</Box>
		);
	}
}

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentGender: null,
			currentTop: null,
			sendGender: null,
			sendTop: null,
			refresh: 0
		};
	}
	handleGenderChange(gender) {
		let genderStr = null;
		if (gender === 50) {
			genderStr = "F";
		}
		if (gender === 100) {
			genderStr = "M";
		}
		this.setState({ currentGender: genderStr });
	}
	handleTopChange(top) {
		let topAbs = null;
		if (top === 100) {
			topAbs = null;
		} else if (top === 0) {
			topAbs = 100;
		} else {
			topAbs = top * 100;
		}
		this.setState({ currentTop: topAbs });
	}
	onRefresh() {
		return { gender: this.state.currentGender, top: this.state.currentTop };
	}
	render() {
		return (
			<div>
				<Provider>
					<Box width={1 / 2} mx="auto" mt={100}>
						<Heading>Random Name</Heading>
						<Flex>
							<GenderSlider
								onChange={gender => this.handleGenderChange(gender)}
							/>
							<TopSlider onChange={top => this.handleTopChange(top)} />
						</Flex>
						<ApolloProvider client={client}>
							<RandomName
								gender={this.state.currentGender}
								top={this.state.currentTop}
								refresh={() => this.onRefresh()}
							/>
						</ApolloProvider>
					</Box>
				</Provider>
			</div>
		);
	}
}

ReactDOM.render(
	<div>
		<App />
	</div>,
	document.getElementById("root")
);
