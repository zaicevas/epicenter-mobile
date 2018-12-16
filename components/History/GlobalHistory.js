import React from "react";
import {
  Button,
  Icon,
  Container,
  Content,
  List,
  ListItem,
  Left,
  Body,
  Right,
  Thumbnail,
  Text
} from "native-base";
import {
  Alert,
  View,
  ActivityIndicator,
  RefreshControl,
  ListView
} from "react-native";
import { Location } from "expo";
import {
  MIN_SMILE_AMOUNT,
  TYPE_PERSON,
  TYPE_CAR
} from "../../constants/Recognition";

const getDate = timestamp => timestamp.substr(0, 10);
const getHours = timestamp => timestamp.substr(11, 19);

const SingleTimestamp = props => {
  const { timestamp } = props;
  const searchReason = ["Not searched", "Missing", "Criminal", "Other"];
  return (
    <ListItem avatar>
      <Left style={{ paddingLeft: "4%" }}>
        <Thumbnail
          small
          source={{
            uri: `data:image/png;base64, ${timestamp.baseImage}`
          }}
        />
      </Left>
      <Body>
        <Text>
          {timestamp.missingModel.type === TYPE_PERSON
            ? `${timestamp.missingModel.firstName} ${timestamp.missingModel
                .lastName}`
            : `${timestamp.missingModel.message}`}
        </Text>
        <Text note>{searchReason[timestamp.missingModel.reason]}</Text>
      </Body>
      <Right>
        <Text note>
          {`${getDate(timestamp.dateAndTime)}\u000A${getHours(
            timestamp.dateAndTime
          )}`}
        </Text>
      </Right>
    </ListItem>
  );
};

const AllTimestamps = props => {
  const { timestampList } = props;
  return timestampList.map(timestamp => (
    <SingleTimestamp key={timestamp.id} timestamp={timestamp} />
  ));
};

class GlobalHistory extends React.Component {
  state = {
    timestampList: [],
    isFetchingData: true,
    refreshing: false
  };

  dataSource = new ListView.DataSource({
    rowHasChanged: (r1, r2) => r1 !== r2
  });

  getFormattedLocation = geocodeArray => {
    const geocode = geocodeArray[0];
    if (!geocode) {
      return "Couldn't get any location data.";
    }
    const streetIsSameAsName =
      geocode.name.substr(0, 5) === geocode.street.substr(0, 5);
    const startString = `${geocode.city}, ${geocode.country}, ${streetIsSameAsName
      ? geocode.name
      : geocode.street}`;
    const endString = `${startString}${streetIsSameAsName
      ? ""
      : "\n" + geocode.name}`;
    return endString;
  };

  getFormattedInfo = (locationString, timestamp) => {
    if (timestamp.missingModel.type === TYPE_PERSON) {
      if (timestamp.smile < MIN_SMILE_AMOUNT) return locationString;
      return `${locationString}
      Had a big smile on his/her face! :)`;
    }
    return `${locationString}${"\n"}Owner: ${timestamp.missingModel
      .firstName} ${timestamp.missingModel.lastName}`;
  };

  printInfo = async data => {
    const location = { longitude: data.longitude, latitude: data.latitude };
    const geocode = await Location.reverseGeocodeAsync(location);
    const locationString = this.getFormattedLocation(geocode);
    const infoString = this.getFormattedInfo(locationString, data);
    console.log(infoString);
    Alert.alert(
      `${data.missingModel.type === TYPE_PERSON
        ? data.missingModel.firstName + " " + data.missingModel.lastName
        : data.missingModel.message}`,
      infoString
    );
  };

  allTimestampsRequest = () =>
    fetch("https://epicentereu.azurewebsites.net/api/timestamps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(response => {
      if (response.status === 200) return Promise.resolve(response.json());
      return Promise.reject(response.json());
    });

  allBaseImagesRequest = () =>
    fetch(
      "https://epicentereu.azurewebsites.net/api/missingmodels/baseimages",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      }
    ).then(response => {
      if (response.status === 200) return Promise.resolve(response.json());
      return Promise.reject(response.json());
    });

  getDataFromApi = () =>
    Promise.all([
      this.allTimestampsRequest(),
      this.allBaseImagesRequest()
    ]).then(responseBody => {
      this.setState({ isFetchingData: false });
      const mapper = {};
      responseBody[1].forEach(
        missingModel => (mapper[missingModel.id] = missingModel.baseImage)
      );
      const timestampList = responseBody[0].map(timestamp => ({
        ...timestamp,
        baseImage: mapper[timestamp.missingModel.id]
      }));
      this.setState({ timestampList: timestampList });
    });

  componentDidMount() {
    this.setState({ isFetchingData: true });
    this.getDataFromApi();
    Location.setApiKey("AIzaSyAuD_4MSfBdHkJQA0XsinH1j0IhfuDFLMc");
  }

  _onRefresh = () => {
    console.log("refreshing");
    this.setState({ refreshing: true });
    this.getDataFromApi().finally(() => this.setState({ refreshing: false }));
  };

  render() {
    return this.state.isFetchingData ? (
      <View style={[styles.container, styles.horizontal]}>
        <ActivityIndicator
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            padding: 20
          }}
          size="large"
          color="blue"
        />
      </View>
    ) : (
      <Container>
        <Content
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
              tintColor="blue"
            />
          }
        >
          <List
            disableLeftSwipe
            leftOpenValue={50}
            dataSource={this.dataSource.cloneWithRows(this.state.timestampList)}
            renderRow={data => <SingleTimestamp timestamp={data} />}
            renderLeftHiddenRow={data => (
              <Button full onPress={() => this.printInfo(data)}>
                <Icon active name="information-circle" />
              </Button>
            )}
          />
        </Content>
      </Container>
    );
  }
}

const styles = {
  rootContainer: {
    position: "relative",
    height: "100%",
    width: "100%"
  },
  container: {
    flex: 1,
    justifyContent: "center"
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10
  },
  helpContainer: {
    marginTop: 5,
    alignItems: "center"
  },
  helpLink: {
    paddingVertical: 15
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7"
  }
};

export default GlobalHistory;
