import React from 'react';
import { withNavigationFocus } from 'react-navigation';
import GlobalHistory from '../components/History/GlobalHistory';
import {Button, Text, Body, Container, Content, Segment} from 'native-base';

class HistoryScreen extends React.Component {
    static navigationOptions = {
        title: 'History'
    };

    render() {
        return <GlobalHistory />;
    }
}

export default HistoryScreen;
