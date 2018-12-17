import React from "react";
import { withNavigationFocus } from "react-navigation";
import GlobalHistory from "../components/History/GlobalHistory";
import { Button, Text, Body, Container, Content, Segment, Toast } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Dimensions,
  TouchableOpacity,
  AsyncStorage,
  Alert
} from "react-native";
import { LOCAL_STORAGE_TIMESTAMPS_KEY } from "../constants/Recognition";

class HistoryScreen extends React.Component {
  state = { clearLocalHistory: null };
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    
    return {
      title: "History",
      headerRight: (
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Clear local history",
              "You cannot undo this action!",
              [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                {
                  text: "Clear",
                  style: "destructive",
                  onPress: () => {
                    params.handleClear();
                    Toast.show({
                text: "Done!",
                buttonText: "Okay",
                type: "success",
                duration: 2000
              })
                    AsyncStorage.setItem(
                      LOCAL_STORAGE_TIMESTAMPS_KEY,
                      JSON.stringify([])
                    );
                  }
                }
              ],
              { cancelable: false }
            );
          }}
          style={{ alignSelf: "center" }}
        >
          <MaterialIcons
            name="delete"
            size={24}
            style={{ marginRight: Dimensions.get("window").width * 0.05 }}
          />
        </TouchableOpacity>
      )
    };
  };

  handleClear = () => {
    this.setState({ clearLocalHistory: this.clearLocalHistorySuccess });
  };

  clearLocalHistorySuccess = () => {
    this.setState({ clearLocalHistory: null });
  };

  componentDidMount() {
    this.props.navigation.setParams({ handleClear: this.handleClear });
  }

  render() {
    return <GlobalHistory navigation={this.props.navigation} clearLocalHistory={this.state.clearLocalHistory} />;
  }
}

export default HistoryScreen;
