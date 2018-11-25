import React from "react";
import { ScrollView } from "react-native";
import { ExpoLinksView } from "@expo/samples";

import { Button } from "react-native";

import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Slider,
  Platform
} from "react-native";

import {
  Ionicons,
  MaterialIcons,
  Foundation,
  MaterialCommunityIcons,
  Octicons
} from "@expo/vector-icons";

import {
  Constants,
  Camera,
  FileSystem,
  Permissions,
  BarCodeScanner
} from "expo";

const landmarkSize = 2;

export default class LinksScreen extends React.Component {
  static navigationOptions = {
    title: "Camera"
  };

  render() {
    return <CustomCamera />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: "#fff"
  },
  bottomButton: {
    marginBottom: 0,
    flex: 0.3,
    height: 58,
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center"
  },
  bottomBar: {
    paddingBottom: 5,
    backgroundColor: "transparent",
    alignSelf: "flex-end",
    justifyContent: "space-between",
    flex: 1,
    flexDirection: "row"
  }
});

class CustomCamera extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }

  processPicture = picture => {
    console.log("Request started");
    fetch("https://epicentertop.azurewebsites.net/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(picture.base64)
    }).then(response => console.log(response));
  };

  takePicture = () => {
    if (this.camera) {
      this.camera.takePictureAsync({
        base64: true,
        onPictureSaved: picture => this.processPicture(picture)
      });
      this.setState({
        foo: Math.random()
      });
    }
  };

  renderBottomBar = () => (
    <View style={styles.bottomBar}>
      <TouchableOpacity
        style={styles.bottomButton}
        onPress={() => {
          this.setState({
            type:
              this.state.type === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
          });
        }}
      >
        <Ionicons name="ios-reverse-camera" size={48} color="#e8e8e8" />
      </TouchableOpacity>
      <View style={{ flex: 0.4 }}>
        <TouchableOpacity
          onPress={this.takePicture}
          style={{ alignSelf: "center" }}
        >
          <Ionicons name="ios-radio-button-on" size={70} color="white" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.bottomButton}
        onPress={this.toggleMoreOptions}
      >
        <Octicons name="kebab-horizontal" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera
            ref={ref => {
              this.camera = ref;
            }}
            style={{ flex: 1 }}
            type={this.state.type}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "transparent",
                flexDirection: "row"
              }}
            >
              {this.renderBottomBar()}
            </View>
          </Camera>
        </View>
      );
    }
  }
}
