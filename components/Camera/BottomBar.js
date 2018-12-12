/* eslint-disable react/prop-types */
import React from 'react';

import { View, TouchableOpacity, Platform } from 'react-native';

import { Ionicons, Octicons } from '@expo/vector-icons';
import { Camera } from 'expo';
import styles from './styles';

const BottomBar = ({
    type, setParentCameraType, isFilming, onFilmButton,
}) => (
    <View style={styles.bottomBar}>
        <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => {
                const getStateType = () => type;
                setParentCameraType(
                    getStateType() === Camera.Constants.Type.back
                        ? Camera.Constants.Type.front
                        : Camera.Constants.Type.back,
                );
            }}
        >
            <Ionicons
                name={Platform.OS === 'ios' ? 'ios-reverse-camera' : 'md-reverse-camera'}
                size={48}
                color="#e8e8e8"
            />
        </TouchableOpacity>
        <View style={{ flex: 0.4 }}>
            <TouchableOpacity onPress={onFilmButton} style={{ alignSelf: 'center' }}>
                <Ionicons
                    name={isFilming ? 'ios-radio-button-off' : 'ios-radio-button-on'}
                    size={70}
                    color={isFilming ? 'red' : 'white'}
                />
            </TouchableOpacity>
        </View>
        <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => console.log('Camera options toggle')}
        >
            <Octicons name="kebab-horizontal" size={30} color="white" />
        </TouchableOpacity>
    </View>
);

export default BottomBar;
