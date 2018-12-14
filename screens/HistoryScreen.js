import React from 'react';

import GlobalHistory from '../components/History/GlobalHistory';

export default class HistoryScreen extends React.Component {
    static navigationOptions = {
        title: 'History',
    };

    render() {
        return <GlobalHistory />;
    }
}
