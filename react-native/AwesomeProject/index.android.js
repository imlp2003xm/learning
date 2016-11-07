/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import Introduction from './my_modules/GetStarted/introduction'
import HelloWorld from './my_modules/GetStarted/hello-world'
import Banana from './my_modules/GetStarted/banana'
import LotsOfStyles from './my_modules/GetStarted/lots-of-styles'
import FixedDimensionsBasics from './my_modules/GetStarted/fixed-dimensions-basics'
import FlexDimensionsBasics from './my_modules/GetStarted/flex-dimensions-basics'
import FlexDirectionBasics from './my_modules/GetStarted/flex-direction-basics'
import PizzaTranslator from './my_modules/GetStarted/pizza-translator'
import UserList from './my_modules/GetStarted/user-list'


const COMPONENT_RENDERERS = {
  FixedDimensionsBasics: ()=> {
    return (
      <FixedDimensionsBasics/>
    )
  },
  FlexDimensionsBasics: ()=> {
    return (
      <FlexDimensionsBasics/>
    )
  },
  FlexDirectionBasics: () => {
    return (
      <FlexDirectionBasics/>
    )
  },
  PizzaTranslator: () => {
    return (
      <PizzaTranslator/>
    )
  },
  UserList: () => {
    return (
      <UserList/>
    )
  }
};

export default class AwesomeProject extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      componentName: 'UserList'
    };
  }
  render() {
    var renderer = COMPONENT_RENDERERS[this.state.componentName];

    return renderer ?  renderer() : null;
  }
}




COMPONENT_RENDERERS.Introduction = ()=> {
  return (
    <Introduction/>
  )
};

COMPONENT_RENDERERS.HelloWorld = function() {
  return (
    <HelloWorld/>
  );
};

COMPONENT_RENDERERS.Banana = () => {
  return (
    <Banana/>
  );
};

COMPONENT_RENDERERS.LotsOfStyles = () => {
  return (
    <LotsOfStyles/>
  )
}

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
