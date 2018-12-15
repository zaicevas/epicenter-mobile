import React from "react";
import {
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
import { View, ActivityIndicator, RefreshControl } from "react-native";

const getDate = timestamp => timestamp.substr(0, 10);
const getHours = timestamp => timestamp.substr(11, 19);

const SingleTimestamp = props => {
  const { timestamp } = props;
  const searchReason = ["Not searched", "Missing", "Criminal", "Other"];
  return (
    <ListItem avatar>
      <Left>
        <Thumbnail
          small
          source={{
            uri: `data:image/png;base64, ${timestamp.baseImage}`
          }}
        />
      </Left>
      <Body>
        <Text>
          {timestamp.missingModel.type === 0 ? `${timestamp.missingModel.firstName} ${timestamp.missingModel
            .lastName}` : `${timestamp.missingModel.message}`}
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

  allTimestampsRequest = fetch(
    "https://epicentereu.azurewebsites.net/api/timestamps",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    }
  ).then(response => {
    if (response.status === 200) return Promise.resolve(response.json());
    return Promise.reject(response.json());
  });

  allBaseImagesRequest = fetch(
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

  componentDidMount() {
    this.setState({ isFetchingData: true });
    Promise.all([
      this.allTimestampsRequest,
      this.allBaseImagesRequest
    ]).then(responseBody => {
      this.setState({ isFetchingData: false });
      const mapper = {};
      console.log(responseBody[0][0].missingModel);
      responseBody[1].forEach(
        missingModel => (mapper[missingModel.id] = missingModel.baseImage)
      );
      const timestampList = responseBody[0].map(timestamp => ({
        ...timestamp,
        baseImage: mapper[timestamp.missingModel.id]
      }));
      this.setState({ timestampList: timestampList });
    });
    // this.allTimestampsRequest
    //   .then(response => {
    //     this.setState({ isFetchingData: false });
    //     if (response.status !== 200) return;
    //     response.json().then(rjson => {
    //       this.setState({ timestampList: rjson });
    //     });
    //   })
    //   .catch(x => {
    //     this.setState({ isFetchingData: false });
    //     console.log(`${x} in globalhistory`);
    //   });
  }

  _onRefresh = () => {
    console.log("refreshing");
    this.setState({ refreshing: true });
    fetch("https://epicentereu.azurewebsites.net/api/timestamps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        console.log("stopped refreshing");
        this.setState({ refreshing: false });
        if (response.status !== 200) return;
        response.json().then(rjson => {
          this.setState({ timestampList: rjson });
        });
      })
      .catch(x => {
        this.setState({ refreshing: false });
        console.log(`${x} in globalhistory`);
      });
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
          <List>
            <AllTimestamps timestampList={this.state.timestampList} />
          </List>
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
