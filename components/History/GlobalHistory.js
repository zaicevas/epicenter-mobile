import React from 'react';
import {
    Container,
    Content,
    List,
    ListItem,
    Left,
    Body,
    Right,
    Thumbnail,
    Text,
} from 'native-base';
import { View, ActivityIndicator } from 'react-native';

const getDate = timestamp => timestamp.substr(0, 10);
const getHours = timestamp => timestamp.substr(11, 19);

const SingleTimestamp = (props) => {
    const { timestamp } = props;
    const searchReason = ['Not searched', 'Missing', 'Criminal', 'Other'];
    return (
        <ListItem avatar>
            <Left>
                <Thumbnail
                    small
                    source={{ uri: `data:image/png;base64, ${timestamp.missingModel.baseImage}` }}
                />
            </Left>
            <Body>
                <Text>
                    {`${timestamp.missingModel.firstName} ${timestamp.missingModel.lastName}`}
                </Text>
                <Text note>{searchReason[timestamp.missingModel.reason]}</Text>
            </Body>
            <Right>
                <Text note>
                    {`${getDate(timestamp.dateAndTime)}\u000A${getHours(timestamp.dateAndTime)}`}
                </Text>
            </Right>
        </ListItem>
    );
};

const AllTimestamps = (props) => {
    const { timestampList } = props;
    return timestampList.map(timestamp => (
        <SingleTimestamp key={timestamp.id} timestamp={timestamp} />
    ));
};

class GlobalHistory extends React.Component {
    state = {
        timestampList: [],
        isFetchingData: true,
    };

    componentDidMount() {
        this.setState({ isFetchingData: true });
        fetch('https://epicentereu.azurewebsites.net/api/timestamps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                this.setState({ isFetchingData: false });
                if (response.status !== 200) return;
                response.json().then((rjson) => {
                    console.log(':-))))))))))))');
                    this.setState({ timestampList: rjson });
                });
            })
            .catch((x) => {
                this.setState({ isFetchingData: false });
                console.log(`${x}in globalhistory`);
            });
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.isScreenFocused && this.props.isScreenFocused) {
            this.componentDidMount();
        }
    }

    render() {
        return this.state.isFetchingData ? (
            <Container>
                <ActivityIndicator
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        padding: 20,
                        zIndex: 20,
                    }}
                    size="large"
                    color="blue"
                />
                <Content>
                    <List>
                        <AllTimestamps timestampList={this.state.timestampList} />
                    </List>
                </Content>
            </Container>
        ) : (
            <Container>
                <Content>
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
        position: 'relative',
        height: '100%',
        width: '100%',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
    helpContainer: {
        marginTop: 5,
        alignItems: 'center',
    },
    helpLink: {
        paddingVertical: 15,
    },
    helpLinkText: {
        fontSize: 14,
        color: '#2e78b7',
    },
};

export default GlobalHistory;