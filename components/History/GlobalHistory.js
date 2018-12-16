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
  Text,
  Segment,
  Header,
  Title,
  Footer,
  FooterTab
} from "native-base";
import {
  Alert,
  View,
  ActivityIndicator,
  RefreshControl,
  ListView,
  AsyncStorage
} from "react-native";
import { Location } from "expo";
import {
  LOCAL_STORAGE_TIMESTAMPS_KEY,
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
    localTimestampList: [],
    isFetchingData: true,
    refreshing: false,
    mode: "My"
  };

  dataSource = new ListView.DataSource({
    rowHasChanged: (r1, r2) => r1 !== r2
  });

  static getDerivedStateFromProps(props, state) {
    if (props.clearLocalHistory) {
      props.clearLocalHistory();
      return {...state,
        localTimestampList: []
      }
    }
    return state;
  }  

  getFormattedLocation = geocodeArray => {
    const geocode = geocodeArray[0];
    if (!geocode) {
      return "No location data.";
    }
    const streetIsSameAsName = !geocode.street ||
      (geocode.name.substr(0, 5) === geocode.street.substr(0, 5));
    const startString = `${geocode.city || ""}, ${geocode.country || ""}, ${streetIsSameAsName
      ? (geocode.name || "")
      : (geocode.street || "")}`;
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

  printInfo = async (data, closeRow) => {
    const location = { longitude: data.longitude, latitude: data.latitude };
    const geocode = await Location.reverseGeocodeAsync(location);
    console.log(geocode);
    const locationString = this.getFormattedLocation(geocode);
    const infoString = this.getFormattedInfo(locationString, data);
    Alert.alert(
      `${data.missingModel.type === TYPE_PERSON
        ? data.missingModel.firstName + " " + data.missingModel.lastName
        : data.missingModel.message}`,
      infoString,
      closeRow
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

  getDataFromApi = async () =>
    Promise.all([
      this.allTimestampsRequest(),
      this.allBaseImagesRequest()
    ]).then(async responseBody => {
      this.setState({ isFetchingData: false });
      const mapper = {};
      responseBody[1].forEach(
        missingModel => (mapper[missingModel.id] = missingModel.baseImage)
      );
      const timestampList = responseBody[0].map(timestamp => ({
        ...timestamp,
        baseImage: mapper[timestamp.missingModel.id]
      }));
      const localList = await this.getLocalTimestamps(timestampList);
      this.setState({ timestampList: timestampList,
      localTimestampList: localList });
    });

  getLocalTimestamps = async list => {
    const nonJsonList = await AsyncStorage.getItem(
      LOCAL_STORAGE_TIMESTAMPS_KEY
    );
    const jsonList = JSON.parse(nonJsonList);
    const localList = list.filter(timestamp =>
      jsonList.includes(timestamp.id)
    );
    return localList;
  };

  componentDidMount() {
    this.setState({ isFetchingData: true });
    this.getDataFromApi();
    Location.setApiKey("AIzaSyAuD_4MSfBdHkJQA0XsinH1j0IhfuDFLMc");
  }

  _onRefresh = () => {
    this.setState({ refreshing: true });
    this.getDataFromApi().finally(() => this.setState({ refreshing: false }));
  };

  closeRow(secId, rowId, rowMap) {
    rowMap[`${secId}${rowId}`].props.closeRow();
  }

  render() {
    return (
      <Container>
        <Segment style={{ backgroundColor: "white" }}>
          <Button
            style={{ borderRightWidth: 0 }}
            active={this.state.mode === "My"}
            onPress={() => this.setState({ mode: "My" })}
            first
          >
            <Text>My</Text>
          </Button>
          <Button
            active={this.state.mode === "All"}
            onPress={() => this.setState({ mode: "All" })}
            last
          >
            <Text>All</Text>
          </Button>
        </Segment>
        {this.state.isFetchingData ? (
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
              dataSource={
                this.state.mode === "All"
                  ? this.dataSource.cloneWithRows(this.state.timestampList)
                  : this.dataSource.cloneWithRows(this.state.localTimestampList)
              }
              renderRow={data => <SingleTimestamp timestamp={data} />}
              renderLeftHiddenRow={(data, secId, rowId, rowMap) => (
                <Button
                  full
                  onPress={() => {
                    this.printInfo(data, () =>
                      this.closeRow(secId, rowId, rowMap)
                    );
                  }}
                >
                  <Icon active name="information-circle" />
                </Button>
              )}
            />
          </Content>
        )}
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
