/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';

const COMPONENT_RENDERERS = {};

export default class AwesomeProject extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      componentName: 'Banana'
    };
  }
  render() {
    var renderer = COMPONENT_RENDERERS[this.state.componentName];

    return renderer ?  renderer() : null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    color: 'red'
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

class Introduction extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.android.js
        </Text>
        <Text style={styles.instructions}>
          Double tap R on your keyboard to reload,{'\n'}
          Shake or press menu button for dev menu
        </Text>
      </View>
    );
  }
}
COMPONENT_RENDERERS.Introduction = ()=> {
  return (
    <Introduction/>
  )
};


class HelloWorld extends Component {
  render() {
    return (
      <Text>Hello World!</Text>
    );
  }
}
COMPONENT_RENDERERS.HelloWorld = function() {
  return (
    <HelloWorld/>
  );
};



class Banana extends Component {
  render() {
    let pic = {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
    };

    return (
      <Image source={pic} style={{width: 193, height: 110}}/>
    );
  }
}

COMPONENT_RENDERERS.Banana = () => {
  return (
    <Banana/>
  );
};
AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
