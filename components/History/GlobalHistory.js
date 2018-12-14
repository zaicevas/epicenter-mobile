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
    };

    componentDidMount() {
        fetch('https://epicentereu.azurewebsites.net/api/timestamps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (response.status !== 200) return;
                response.json().then((rjson) => {
                    console.log(':-))))))))))))');
                    this.setState({ timestampList: rjson });
                });
            })
            .catch(x => console.log(x));
    }

    render() {
        return (
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

export default GlobalHistory;
