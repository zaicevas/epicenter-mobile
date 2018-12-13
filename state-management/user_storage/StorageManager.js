import { AsyncStorage } from 'react-native';

const PREFIX = '@';

class StorageManager {
    getData = async (key) => {
        try {
            const value = await AsyncStorage.getItem(`${PREFIX}${key}`);
            return value;
        } catch (error) {
            console.log(`Error in StorageManager.getData(): ${error}`);
        }
    };
}

export default StorageManager;
