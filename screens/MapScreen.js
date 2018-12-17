import React from "react";
import { MapView } from "expo";
import { Button, Text } from "native-base";

class MapScreen extends React.Component {
  render() {
    const { navigation } = this.props;
    const timestamp = navigation.getParam("timestamp", {
      longitude: 25.213513073304817,
      latitude: 54.689606837107405
    });
    console.log(timestamp);
    return (
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: timestamp.latitude,
          longitude: timestamp.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        }}
      >
        <MapView.Marker
          coordinate={{
            longitude: timestamp.longitude,
            latitude: timestamp.latitude
          }}
          title={
            timestamp.missingModel.type === 0
              ? `${timestamp.missingModel.firstName} ${timestamp.missingModel
                  .lastName}`
              : timestamp.missingModel.message
          }
          description="desc"
        />
        <MapView.Circle
          center={{
            longitude: timestamp.longitude,
            latitude: timestamp.latitude
          }}
          strokeColor="red"
          strokeWidth={2}
          radius={500}
        />
      </MapView>
    );
  }
}

export default MapScreen;
