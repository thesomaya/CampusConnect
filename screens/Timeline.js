import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Button, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import PageContainer from '../components/PageContainer';
import PostItem from '../components/PostItem';
import colors from '../constants/colors';
import { createPost } from '../utils/actions/postActions';
import { launchImagePicker, uploadDocumentToFirebase, uploadImageToFirebase } from '../utils/imagePickerHelper';
import { launchDocumentPicker } from '../utils/launchDocumentPicker';

const Timeline = props => {
    const userData = useSelector(state => state.auth.userData);
    const postsData = useSelector(state => state.posts.postsData);
    const [modalVisible, setModalVisible] = useState(false);
    const [postText, setPostText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    
    const storedPosts = useSelector(state => {
        const postsData = state.posts.postsData;
        return Object.values(postsData).sort((a, b) => {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
    });

    const openImageLibrary = () => {
        launchImagePicker({ mediaType: 'photo' }, response => {
            if (!response.didCancel) {
                setSelectedImage(response);
            }
        });
    };

    const openDocumentPicker = () => {
        launchDocumentPicker(selectedDocument => {
            setSelectedDocument(selectedDocument);
        });
    };

    const handlePost = async () => {
        if (selectedImage) {
            const imageUrl = await uploadImageToFirebase(selectedImage);
        }
        if (selectedDocument) {
            const documentUrl = await uploadDocumentToFirebase(selectedDocument);
        }

        await createPost(userData.userId, postText);

        setPostText('');
        setSelectedImage(null);
        setSelectedDocument(null);
        setModalVisible(false);

        
    };

    return (
        <PageContainer>
            <Text style={styles.title}>Timeline</Text>
            {userData.selectedRole === 'facultyMember' && (
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text style={styles.newAnnouncement}>New Announcement</Text>
                </TouchableOpacity>
            )}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>
                    </View>
                    <View style={styles.modalContent}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Write your announcement here"
                            value={postText}
                            onChangeText={text => setPostText(text)}
                            multiline
                        />
                        <View style={styles.iconContainer}>
                            <TouchableOpacity onPress={openImageLibrary}>
                                <Ionicons name="image" size={24} color="black" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={openDocumentPicker}>
                                <Ionicons name="document" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                        <Button title="Post" style={styles.button} onPress={handlePost} />
                    </View>
                </View>
            </Modal>
            <FlatList
                data={storedPosts}
                renderItem={({ item }) => (
                <PostItem
                key={item.key}
                postText={item.text}
                />
    )}
/>
        </PageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    newAnnouncement: {
        fontSize: 18,
        color: colors.primary,
        textDecorationLine: 'underline',
        marginBottom: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
        position: 'relative',
    },
    textInput: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        width: '100%',
        minHeight: 100,
        padding: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
    },
    closeButton: {
        flexDirection: 'row',
        marginBottom: 2,
        alignItems: "right",
        position: 'relative',
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
});


export default Timeline;
