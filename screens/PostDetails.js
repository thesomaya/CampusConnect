import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../constants/colors';

const PostDetails = ({ route }) => {
    const { post } = route.params;

    const handleDownload = async () => {
        try {
            const downloadResumable = FileSystem.createDownloadResumable(
                post.docUrl,
                FileSystem.documentDirectory + 'downloadedDocument'
            );

            const { uri } = await downloadResumable.downloadAsync();

            if (uri) {
                await Sharing.shareAsync(uri);
            } else {
                console.error('Failed to download document.');
            }
        } catch (error) {
            console.error('Error downloading document:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{post.text}</Text>

            {post.imageUrl && (
                <Image source={{ uri: post.imageUrl }} style={styles.imageContainer} />
            )}

            {post.docUrl && (
                <View style={styles.downloadContainer}>
                    <TouchableOpacity onPress={handleDownload} style={styles.downloadContainer}>
                        <Text style={styles.downloadText}>Download file</Text>
                        <Ionicons name="download" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  text: {
    marginBottom: 10,
  },
  imageContainer: {
    width: 200,
    height: 200,
    marginBottom: 10,
    borderRadius: 10, 
    borderColor: colors.lightGrey,
    borderWidth: 1,
  },
  downloadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  downloadText: {
    fontWeight: 'bold',
    textDecorationLine: 'underline', 
    marginRight: 10,
  },
});

export default PostDetails;
