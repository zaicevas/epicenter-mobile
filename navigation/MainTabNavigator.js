/* eslint-disable react/prop-types */
import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import HistoryScreen from '../screens/HistoryScreen';

const HomeStack = createStackNavigator({
    Home: HomeScreen,
});

HomeStack.navigationOptions = {
    tabBarLabel: 'Home',
    tabBarIcon: ({ focused }) => (
        <TabBarIcon
            focused={focused}
            name={
                Platform.OS === 'ios'
                    ? `ios-information-circle${focused ? '' : '-outline'}`
                    : 'md-information-circle'
            }
        />
    ),
};

const CameraStack = createStackNavigator({
    Camera: CameraScreen,
});

CameraStack.navigationOptions = {
    tabBarLabel: 'Camera',
    tabBarIcon: ({ focused }) => (
        <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'md-camera' : 'md-link'} />
    ),
};

const HistoryStack = createStackNavigator({
    History: HistoryScreen,
});

HistoryStack.navigationOptions = {
    tabBarLabel: 'History',
    tabBarIcon: ({ focused }) => (
        <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-book' : 'md-book'} />
    ),
};

export default createBottomTabNavigator({
    HomeStack,
    CameraStack,
    HistoryStack,
});
