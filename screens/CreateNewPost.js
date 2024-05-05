import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

const CreatePostScreen = ({ navigation }) => {
    const [postText, setPostText] = useState('');

    const submitPost = () => {
        // Here you can submit the post, upload files/photos, etc.
        // After submitting, you may want to navigate back to the timeline screen
        navigation.goBack();
    };

    return (
        <View>
            <TextInput
                multiline
                placeholder="Type ..."
                value={postText}
                onChangeText={text => setPostText(text)}
            />
            {/* Add functionality to attach files/photos */}
            <Button title="Submit" onPress={submitPost} />
        </View>
    );
};

export default CreatePostScreen;
