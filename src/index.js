import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Slider, Row, Col, Button, Layout, Menu, Icon } from "antd";
import "antd/dist/antd.css";
const { Header, Sider, Content } = Layout;

const config = require("./config");

const client = new ApolloClient({
	//cache: new InMemoryCache(),
	uri: config.APIURL
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
	if (value < 50 && value !== 100) {
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
							<h1>
								{name.firstName} {name.surname}
							</h1>
							<Button
								type="primary"
								size="large"
								shape="circle"
								icon="reload"
								onClick={() => {
									refetch(this.props.refresh());
								}}
							/>
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
			<Col xs={24} sm={12} md={12} lg={12} xl={12}>
				<div className="slider">
					<p>Gender</p>
					<Slider
						tipFormatter={formatter}
						marks={marks}
						step={null}
						defaultValue={0}
						onChange={value => this.props.onChange(value)}
					/>
				</div>
			</Col>
		);
	}
}

class TopSlider extends React.Component {
	render() {
		return (
			<Col xs={24} sm={12} md={12} lg={12} xl={12}>
				<div className="slider">
					<p>Top</p>
					<Slider
						defaultValue={100}
						marks={topMarks}
						tipFormatter={topFormatter}
						onChange={value => this.props.onChange(value)}
					/>
				</div>
			</Col>
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
			refresh: 0,
			collapsed: false
		};
	}
	toggle = () => {
		this.setState({
			collapsed: !this.state.collapsed
		});
	};
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
			<Layout className="container">
				<Sider trigger={null} collapsible collapsed={this.state.collapsed}>
					<div className="logo">
						<img
							src={require("./logo.png")}
							srcSet={`
    						${require("./logo@2x.png")} 2x, 
    						${require("./logo.png")} 1x
							`}
							alt="Logo"
						/>
					</div>
					<Menu theme="dark" mode="inline" defaultSelectedKeys={["2"]}>
						<Menu.Item key="1">
							<Icon type="home" />
							<span>About</span>
						</Menu.Item>
						<Menu.Item key="2">
							<Icon type="user" />
							<span>Random Name</span>
						</Menu.Item>
					</Menu>
				</Sider>
				<Layout>
					<Header style={{ background: "#fff", padding: "0 0 0 24px" }}>
						<Icon
							className="trigger"
							type={this.state.collapsed ? "menu-unfold" : "menu-fold"}
							onClick={this.toggle}
							style={{ fontSize: 16 }}
						/>
					</Header>
					<Content
						style={{
							margin: "24px 16px",
							padding: 24,
							background: "#fff",
							minHeight: 280
						}}
					>
						<Row type="flex" justify="center">
							<Col xs={24} sm={18} md={16} lg={14} xl={12}>
								<h1>Random Name</h1>
								<Row type="flex" justify="center">
									<GenderSlider
										onChange={gender => this.handleGenderChange(gender)}
									/>
									<TopSlider onChange={top => this.handleTopChange(top)} />
								</Row>
								<ApolloProvider client={client}>
									<RandomName
										gender={this.state.currentGender}
										top={this.state.currentTop}
										refresh={() => this.onRefresh()}
									/>
								</ApolloProvider>
							</Col>
						</Row>
					</Content>
				</Layout>
			</Layout>
		);
	}
}

ReactDOM.render(<App />, document.getElementById("root"));
