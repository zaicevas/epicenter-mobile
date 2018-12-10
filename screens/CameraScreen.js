import React from 'react';
import { withNavigationFocus } from 'react-navigation';
import CustomCamera from '../components/Camera/CustomCamera';

class CameraScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  render() {
    return <CustomCamera isScreenFocused={this.props.isFocused} />;
  }
}

export default withNavigationFocus(CameraScreen);
