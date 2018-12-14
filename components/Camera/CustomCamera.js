/* eslint-disable global-require */
/* eslint-disable linebreak-style */
import React from 'react';
import NotificationPopup from 'react-native-push-notification-popup';
import 'abortcontroller-polyfill';
import { View } from 'react-native';
import { Camera, Permissions } from 'expo';
import { Text, Toast } from 'native-base';
import BottomBar from './BottomBar';

const MAX_PICTURE_ERRORS = 20;
const MILISECOND = 1000;
const ENTITY_NOTIFICATION_INTERVAL_IN_SECONDS = 30;
const MIN_SMILE_AMOUNT = 0.85; // [0, 1]
const SMILE_TOAST_DURATION_IN_MS = 4000;

const { AbortController } = window;
const controller = new AbortController();
const { signal } = controller;

class CustomCamera extends React.Component {
    constructor(props) {
        super(props);
        this.takePicture = this.takePicture.bind(this);
    }

    state = {
        hasCameraPermission: null,
        type: Camera.Constants.Type.back,
        isFilming: false,
    };

    pictureTakeError = 0;

    entitiesSet = new Set();

    smilesSet = new Set();

    static getDerivedStateFromProps(props, state) {
        if (!props.isScreenFocused) {
            // eslint-disable-next-line no-param-reassign
            state.isFilming = false;
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
        const isFilmingChanged = prevState.isFilming !== this.state.isFilming;
        const stoppedFilming = isFilmingChanged && !this.state.isFilming;
        const startedFilming = isFilmingChanged && this.state.isFilming;
        if (stoppedFilming) controller.abort();
        else if (startedFilming) signal.aborted = false;
    }

    takePicture = () => {
        this.camera.takePictureAsync({
            base64: true,
            quality: 0,
            onPictureSaved: picture => this.processPicture(picture),
        });
    };

    doSmth = () => null;

    processPicture = (picture) => {
        this.pictureTakeError = 0;
        const requestBody = this.getRequestBody(picture.base64);
        fetch('https://epicentereu.azurewebsites.net/api', {
            method: 'POST',
            signal,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        }).then((response) => {
            this.doSmth();
            this.takePicture();
        });
    };

    getUnseenEntities = (response) => {
        const unseenEntities = [];
        response.forEach((recognizedObject) => {
            if (!this.entitiesSet.has(recognizedObject.id)) {
                unseenEntities.push(recognizedObject);
            }
        });
        if (unseenEntities.length > 0) this.updateEntitiesSet(unseenEntities, this.entitiesSet);
        return unseenEntities;
    };

    isSomeoneUniqueSmiling = (response) => {
        const uniqueSmileIds = [];
        response.forEach((recognizedObject) => {
            const uniqueAndSmiling = !this.smilesSet.has(recognizedObject.id)
                && recognizedObject.smile > MIN_SMILE_AMOUNT;
            if (uniqueAndSmiling) uniqueSmileIds.push(recognizedObject);
        });
        if (uniqueSmileIds.length > 0) {
            this.updateEntitiesSet(uniqueSmileIds, this.smilesSet);
            Toast.show({
                text: 'Subject is smiling. He might be a maniac',
                textStyle: { color: 'yellow' },
                type: 'default',
                position: 'bottom',
                duration: SMILE_TOAST_DURATION_IN_MS,
            });
        }
    };

    doRecognition = (requestBody) => {
        console.log('dorecognition');
        fetch('https://epicentereu.azurewebsites.net/api', {
            method: 'POST',
            signal,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        }).then((response) => {
            console.log('WTFNIGGA');
            this.takePicture();
        });
    };

    getRequestBody = base64 => ({
        latitude: 0.0,
        longitude: 0.0,
        imageBase64: base64,
        findPlate: true,
        findFace: true,
    });

    showNotification = (response) => {
        if (!response) return null;
        const modelType = ['Person', 'Car']; // Plate (instead of Car) in backend
        const searchReason = ['Not searched', 'Missing', 'Criminal', 'Other'];
        let message = '';
        response.forEach((recognizedObject) => {
            const fullName = `${recognizedObject.firstName} ${recognizedObject.lastName}`;
            if (modelType[recognizedObject.type] === 'Car') {
                message += `${recognizedObject.message} (${
                    searchReason[recognizedObject.reason]
                }, Owner: ${fullName})\n`;
            } else if (modelType[recognizedObject.type] === 'Person') {
                message += `${fullName} (${searchReason[recognizedObject.reason]})\n`;
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
            title: 'Error',
            body: message,
        });
    };

    onFilmButton = () => {
        const { isFilming } = this.state;
        if (this.camera && !isFilming) this.takePicture();
        this.setState({ isFilming: !isFilming });
    };

    updateEntitiesSet(recognizedObjects, set) {
        recognizedObjects.forEach((recognizedObject) => {
            const { id } = recognizedObject;
            set.add(id);
            setTimeout(
                (entityId) => {
                    set.delete(entityId);
                },
                ENTITY_NOTIFICATION_INTERVAL_IN_SECONDS * MILISECOND,
                id,
            );
        });
    }

    render() {
        const { hasCameraPermission } = this.state;
        if (hasCameraPermission === null) return <View />;
        if (hasCameraPermission === false) return <Text>No access to camera</Text>;
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
                        <BottomBar
                            type={this.state.type}
                            setParentCameraType={type => this.setState({ type })}
                            isFilming={this.state.isFilming}
                            onFilmButton={() => this.onFilmButton()}
                        />
                    </View>
                </Camera>
                <NotificationPopup ref={ref => (this.popup = ref)} />
            </View>
        );
    }
}

export default CustomCamera;
