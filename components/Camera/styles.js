import { StyleSheet } from 'react-native';

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

export default styles;
