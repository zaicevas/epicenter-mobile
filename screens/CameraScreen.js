import React from 'react';
import { withNavigationFocus } from 'react-navigation';
import PropTypes from 'prop-types';
import CustomCamera from '../components/Camera/CustomCamera';

class CameraScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    render() {
        return <CustomCamera isScreenFocused={this.props.isFocused} />;
    }
}

CameraScreen.propTypes = {
    isFocused: PropTypes.bool.isRequired,
};

export default withNavigationFocus(CameraScreen);
