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
                <Text>{timestamp.missingModel.firstName + timestamp.missingModel.lastName}</Text>
                <Text note>{searchReason[timestamp.missingModel.reason]}</Text>
            </Body>
            <Right>
                <Text note>{'2018-12-12\u000A15:34:53'}</Text>
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
        fetch('https://epicentereu.azurewebsites.net/api/cars/timestamps', {
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
