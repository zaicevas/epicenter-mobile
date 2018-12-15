import React from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    RefreshControl
} from 'react-native';
import { WebBrowser } from 'expo';

import { MonoText } from '../components/StyledText';

export default class HomeScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    render() {
        return (
            <View style={styles.container}>
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                >
                    <View style={styles.welcomeContainer}>
                        <Image
                            source={require('../assets/images/robot-dev.jpg')}
                            style={styles.welcomeImage}
                        />
                    </View>

                    <View style={styles.getStartedContainer}>
                        {this._maybeRenderDevelopmentModeWarning()}

                        <Text style={styles.getStartedText}>Get started by opening</Text>

                        <View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
                            <MonoText style={styles.codeHighlightText}>Camera</MonoText>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.tabBarInfoContainer}>
                    <TouchableOpacity onPress={this._handleHelpPress} style={styles.helpLink}>
                        <Text style={styles.helpLinkText}>
                            Help, Im having issues with Epicenter!
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    _maybeRenderDevelopmentModeWarning() {
        const learnMoreButton = (
            <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
                Learn more
            </Text>
        );

        return (
            <Text style={styles.developmentModeText}>
                Make the world a better place by finding missing people, cars and criminals!
                {' '}
                {learnMoreButton}
            </Text>
        );
    }

    _handleLearnMorePress = () => {
        WebBrowser.openBrowserAsync('https://github.com/tozaicevas/epicenter-mobile');
    };

    _handleHelpPress = () => {
        WebBrowser.openBrowserAsync('https://google.lt');
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    developmentModeText: {
        marginBottom: 20,
        color: 'rgba(0,0,0,0.4)',
        fontSize: 14,
        lineHeight: 19,
        textAlign: 'center',
    },
    contentContainer: {
        paddingTop: 30,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    welcomeImage: {
        height: 80,
        resizeMode: 'contain',
        marginTop: 3,
        marginLeft: -10,
    },
    getStartedContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 50,
    },
    homeScreenFilename: {
        marginVertical: 7,
    },
    codeHighlightText: {
        color: 'rgba(96,100,109, 0.8)',
    },
    codeHighlightContainer: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 3,
        paddingHorizontal: 4,
    },
    getStartedText: {
        alignSelf: 'center',
        fontSize: 22,
        color: 'rgba(96,100,109, 1)',
        lineHeight: 24,
        textAlign: 'center',
        marginTop: 94,
    },
    tabBarInfoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowOffset: { height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 20,
            },
        }),
        alignItems: 'center',
        backgroundColor: '#fbfbfb',
        paddingVertical: 1,
    },
    tabBarInfoText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        textAlign: 'center',
    },
    navigationFilename: {
        marginTop: 5,
    },
    helpContainer: {
        marginTop: 15,
        alignItems: 'center',
    },
    helpLink: {
        paddingVertical: 15,
    },
    helpLinkText: {
        fontSize: 14,
        color: '#2e78b7',
    },
});
