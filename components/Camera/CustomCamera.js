/* eslint-disable global-require */
import React from 'react';
import NotificationPopup from 'react-native-push-notification-popup';
import 'abortcontroller-polyfill';

import {
    StyleSheet, Text, View, TouchableOpacity, Platform,
} from 'react-native';

import { Ionicons, Octicons } from '@expo/vector-icons';

import { Camera, Permissions } from 'expo';

const { AbortController } = window;
const controller = new AbortController();
const { signal } = controller;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 15,
        backgroundColor: '#fff',
    },
    bottomButton: {
        marginBottom: 0,
        flex: 0.3,
        height: 58,
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
    },
    bottomBar: {
        paddingBottom: 5,
        backgroundColor: 'transparent',
        alignSelf: 'flex-end',
        justifyContent: 'space-between',
        flex: 1,
        flexDirection: 'row',
    },
});

class CustomCamera extends React.Component {
    state = {
        hasCameraPermission: null,
        type: Camera.Constants.Type.back,
        isFilming: false,
    };

    static getDerivedStateFromProps(props, state) {
        if (!props.isScreenFocused) {
            // eslint-disable-next-line no-param-reassign
            state.isFilming = false;
            console.log('Camera screen is no longer focused');
            controller.abort();
        }
        return state;
    }

    async componentDidMount() {
        const { permissions } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermission: permissions[Permissions.CAMERA].status === 'granted',
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.isFilming !== this.state.isFilming && !this.state.isFilming) {
            console.log('componentDidUpdate');
            controller.abort();
        }
    }

    processPicture = (picture) => {
        fetch('https://epicentertop.azurewebsites.net/api', {
            method: 'POST',
            signal,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(picture.base64),
        })
            .then(
                response => new Promise((resolve, reject) => {
                    console.log(response);
                    if (response.status !== 200) reject(new Error('Response status is not 200'));
                    else resolve(response.json());
                }),
                (ex) => {
                    if (ex.name !== 'AbortError') {
                        this.setState({ isFilming: false });
                        this.showErrorPopup(String(ex));
                    } else {
                        console.log('FETCH ABORTED');
                        signal.aborted = false;
                    }
                },
            )
            .then(
                (response) => {
                    if (!this.state.isFilming) {
                        // if user switched tab/pressed on filming,
                        // we don't show the notification any more
                        return;
                    }
                    this.showPopup(response);
                    // user might have pushed the button or switched the tabs,
                    // so let's check isFilming
                    this.takePicture();
                },
                () => {
                    if (this.state.isFilming) this.takePicture();
                },
            );
    };

    showPopup = (response) => {
        if (!response) return null;
        const modelType = ['Person', 'Car']; // Plate (instead of Car) in backend
        const searchReason = ['Not searched', 'Missing', 'Criminal', 'Other'];
        let message = '';
        response.forEach((recognizedObject) => {
            const fullName = `${recognizedObject.firstName} ${recognizedObject.lastName}`;
            if (modelType[recognizedObject.type] === 'Car') {
                message += `${searchReason[recognizedObject.reason]} car ${
                    recognizedObject.message
                } (belongs to ${fullName})\n`;
            } else if (modelType[recognizedObject.type] === 'Person') {
                message += `FOUND: ${searchReason[recognizedObject.reason]} ${fullName}.\n`;
            }
            message += `${modelType[recognizedObject.type]} was last seen at ${
                recognizedObject.lastSeen
            }\n`;
        });
        this.popup.show({
            appIconSource: require('../../assets/images/robot-dev.jpg'),
            appTitle: 'Epicenter',
            timeText: 'Now',
            title: "You've found something!",
            body: message,
        });
    };

    showErrorPopup = (message) => {
        this.popup.show({
            appIconSource: require('../../assets/images/robot-dev.jpg'),
            appTitle: 'Epicenter',
            timeText: 'Now',
            title: 'Error!',
            body: message,
        });
    };

    takePicture = () => {
        console.log('takePicture()');
        this.camera
            .takePictureAsync({
                base64: true,
                quality: 0,
                onPictureSaved: picture => this.processPicture(picture),
            })
            .catch((error) => {
                // TODO: only show error popup when a lot of takePicture() end up there
                this.showErrorPopup(String(error));
                if (this.state.isFilming) this.takePicture();
            });
        // eslint-disable-next-line react/no-unused-state
        this.setState({ foo: Math.random() });
    };

    onFilmButton = () => {
        const { isFilming } = this.state;
        if (this.camera && !isFilming) this.takePicture();
        this.setState({ isFilming: !isFilming });
    };

    renderBottomBar = () => (
        <View style={styles.bottomBar}>
            <TouchableOpacity
                style={styles.bottomButton}
                onPress={() => {
                    const getStateType = () => this.state.type;
                    this.setState({
                        type:
                            getStateType() === Camera.Constants.Type.back
                                ? Camera.Constants.Type.front
                                : Camera.Constants.Type.back,
                    });
                }}
            >
                <Ionicons
                    name={Platform.OS === 'ios' ? 'ios-reverse-camera' : 'md-reverse-camera'}
                    size={48}
                    color="#e8e8e8"
                />
            </TouchableOpacity>
            <View style={{ flex: 0.4 }}>
                <TouchableOpacity onPress={this.onFilmButton} style={{ alignSelf: 'center' }}>
                    <Ionicons
                        name={this.state.isFilming ? 'ios-radio-button-off' : 'ios-radio-button-on'}
                        size={70}
                        color={this.state.isFilming ? 'red' : 'white'}
                    />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.bottomButton} onPress={this.toggleMoreOptions}>
                <Octicons name="kebab-horizontal" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );

    render() {
        const { hasCameraPermission } = this.state;
        if (hasCameraPermission === null) {
            return <View />;
        }
        if (hasCameraPermission === false) {
            return <Text>No access to camera</Text>;
        }
        return (
            <View style={{ flex: 1 }}>
                <Camera
                    ref={(ref) => {
                        this.camera = ref;
                    }}
                    style={{ flex: 1 }}
                    type={this.state.type}
                >
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: 'transparent',
                            flexDirection: 'row',
                        }}
                    >
                        {this.renderBottomBar()}
                    </View>
                </Camera>
                <NotificationPopup ref={ref => (this.popup = ref)} />
            </View>
        );
    }
}

export default CustomCamera;
