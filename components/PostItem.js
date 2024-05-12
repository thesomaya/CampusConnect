import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const PostItem = props => {
    const { postText } = props;
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{postText}</Text>
            {/* Render other post details as needed */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    text: {
        fontSize: 16,
    },
});

export default PostItem;
