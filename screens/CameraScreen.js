import React from 'react';
import { withNavigationFocus } from 'react-navigation';
import PropTypes from 'prop-types';
import moment from 'moment';
import CustomCamera from '../components/Camera/CustomCamera';

class CameraScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    render() {
        const now = moment().format('YYYY-MM-DD HH:mm:ss');
        console.log(now);
        return <CustomCamera isScreenFocused={this.props.isFocused} />;
    }
}

CameraScreen.propTypes = {
    isFocused: PropTypes.bool.isRequired,
};

export default withNavigationFocus(CameraScreen);
