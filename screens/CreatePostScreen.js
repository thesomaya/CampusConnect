import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Button,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import colors from '../constants/colors';
import { createPost } from '../utils/actions/postActions';
import {
    launchImagePicker,
    uploadImageAsync,
} from '../utils/imagePickerHelper';
import {
    launchDocumentPicker,
    uploadDocumentAsync,
} from '../utils/launchDocumentPicker';

const CreatePostScreen = ({ navigation }) => {
  const [tempImageUri, setTempImageUri] = useState('');
  const [tempDocUri, setTempDocUri] = useState('');
  const [tempDocName, setTempDocName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const userData = useSelector((state) => state.auth.userData);
  const [postTitle, setPostTitle] = useState('');
  const [postText, setPostText] = useState('');
  const scrollViewRef = useRef(null);
  const scrollY = useRef(0);

  const pickImage = useCallback(async () => {
    try {
      const tempUri = await launchImagePicker();
      if (!tempUri) return;
      setTempImageUri(tempUri);
    } catch (error) {
      console.log(error.message);
    }
  }, [tempImageUri]);

  const pickDocument = useCallback(async () => {
    try {
      const documentInfo = await launchDocumentPicker();
      if (!documentInfo) return;
      const { name, uri } = documentInfo;
      setTempDocUri(uri);
      setTempDocName(name);
    } catch (error) {
      console.log(error.message);
    }
  }, [tempDocUri, tempDocName]);

  const uploadImage = useCallback(async () => {
    try {
      const uploadUrl = await uploadImageAsync(tempImageUri, true);
      return uploadUrl;
    } catch (error) {
      console.log(error.message);
    }
  });

  const uploadDocument = useCallback(async () => {
    try {
      const uploadUrl = await uploadDocumentAsync(tempDocUri, true);
      return uploadUrl;
    } catch (error) {
      console.log(error.message);
    }
  });

  const handlePost = async () => {
    setIsLoading(true);
    let image = null,
      document = null;
    if (tempImageUri) {
      image = await uploadImage(tempImageUri);
    }
    if (tempDocUri) {
      document = await uploadDocument(tempDocUri);
    }

    await createPost(userData.userId, postTitle, postText, image, document);

    setPostTitle('');
    setPostText('');
    setTempImageUri(null);
    setTempDocUri(null);
    setIsLoading(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>New Post</Text>
      </View>
      <TextInput
        style={styles.titleInput}
        placeholder="Write the title here"
        value={postTitle}
        onChangeText={(text) => setPostTitle(text)}
      />
      <ScrollView style={styles.scrollView} ref={scrollViewRef}>
        <TextInput
          style={styles.textInput}
          placeholder="Write your post here"
          value={postText}
          onChangeText={(text) => setPostText(text)}
          multiline
        />
      </ScrollView>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Ionicons name="image" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={pickDocument}>
          <Ionicons name="document" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {!isLoading && (
        <Button title="Post" onPress={handlePost} />
      )}
      {isLoading && <ActivityIndicator size="small" />}
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
      },
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 5,
    width: '100%',
    minHeight: 50,
    padding: 10,
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 5,
    width: '100%',
    minHeight: 200,
    padding: 10,
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
    marginBottom: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});

export default CreatePostScreen;
