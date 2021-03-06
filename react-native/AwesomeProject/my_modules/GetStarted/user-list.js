'use strict'

import React, { Component } from 'react'
import {
	StyleSheet,
	Text,
	View,
	ListView,
	TouchableOpacity,
	ActivityIndicator,
	Alert
} from 'react-native'

var API_URL = 'http://demo9383702.mockable.io/users';

export default class UserList extends Component {
	constructor(props) {
		super(props)

		this.state = {
			loaded: false,
			dataSource: new ListView.DataSource({
				getSectionHeaderData: (dataBlob, sectionID) => {
					return dataBlob[sectionID]
				},
				getRowData: (dataBlob, sectionID, rowID) => {
					return dataBlob[sectionID + ':' + rowID]
				},
				rowHasChanged: (row1, row2) => row1 !== row2,
				sectionHeaderHasChanged: (s1, s2) => s1 != s2
			})
		}
		this.bindMethods()
	}

	bindMethods() {
		if (!this.bindableMethods) {
			return
		}

		for (var methodName in this.bindableMethods) {
			this[methodName] = this.bindableMethods[methodName].bind(this)
		}
	}

	componentDidMount() {
		this.fetchData()
	}

	fetchData() {
		fetch(API_URL).then((response) => response.json()).then((responseData) => {
			var organizations = responseData.results
			var length = organizations.length
			var dataBlob = {}
			var sectionIDs = []
			var rowIDs = []
			var organization
			var users
			var userLength
			var user
			var i, j

			for (i = 0; i < length; ++i) {
				organization = organizations[i]

				sectionIDs.push(organization.id)
				dataBlob[organization.id] = organization.organization

				users = organization.users
				userLength = users.length

				rowIDs[i] = []

				for (j = 0; j < userLength; ++j) {
					user = users[j].user 
					rowIDs[i].push(user.md5)

					dataBlob[organization.id + ':' + user.md5] = user
				}
			}

			this.setState({
				dataSource: this.state.dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs),
				loaded: true
			})
		}).done()
	}

	render() {
		if (!this.state.loaded) {
			return this.renderLoadingView()
		}

		return this.renderListView()
	}

	renderLoadingView() {
		return (
			<View style={styles.header}>
				<Text style={styles.headerText}>User List</Text>
				<View style={styles.container}>
					<ActivityIndicator animating={!this.state.loaded}
					                   style={[styles.activityIndicator, {height: 80}]}
					                   size="large"/>
				</View>
			</View>
		)
	}

	renderListView() {
		return (
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.headerText}>User List</Text>
				</View>
				<ListView dataSource={this.state.dataSource}
				          style={styles.listview}
				          renderRow={this.renderRow}
				          renderSectionHeader={this.renderSectionHeader}/>
			</View>
		)
	}
}

Object.assign(UserList.prototype, {
	bindableMethods: {
		renderSectionHeader: function(sectionData, sectionID) {
			return (
				<View style={styles.section}>
					<Text style={styles.text}>{sectionData}</Text>
				</View>
			)
		},

		renderRow: function(rowData, sectionID, rowID) {
			return (
				<TouchableOpacity onPress={() => this.onPressRow(rowData, sectionID)}>
					<View style={styles.rowStyle}>
						<Text style={styles.rowText}>{rowData.name.title} {rowData.name.first} {rowData.name.last}</Text>
					</View>
				</TouchableOpacity>
			)
		},

		onPressRow: function(rowData, sectionID) {
			var buttons = [
				{
					text: 'Cancel'
				},
				{
					text: 'OK',
					onPress: () => this.createCalendarEvent(rowData, sectionID)
				}
			]
			Alert.alert('User\' Email is ' + rowData.email, null, null)
		}
	}
})

var styles = StyleSheet.create({
	container: {
		flex: 1
	},
	activityIndicator: {
		alignItems: 'center',
		justifyContent: 'center'
	},
	header: {
		height: 60,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#3F51B5',
		flexDirection: 'column',
		paddingTop: 25
	},
	headerText: {
		fontWeight: 'bold',
		fontSize: 20,
		color: 'white'
	},
	text: {
		color: 'white',
		paddingHorizontal: 8,
		fontSize: 16
	},
	rowStyle: {
		paddingVertical: 20,
		paddingLeft: 16,
		borderTopColor: 'white',
		borderLeftColor: 'white',
		borderRightColor: 'white',
		borderBottomColor: '#E0E0E0',
		borderWidth: 1
	},
	rowText: {
		color: '#212121',
		fontSize: 16
	},
	subText: {
		fontSize: 14,
		color: '#757575'
	},
	section: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',
		padding: 6,
		backgroundColor: '#2196F3'
	}
})