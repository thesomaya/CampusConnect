import { AntDesign, Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSelector } from "react-redux";
import colors from "../constants/colors";
import { createPost } from "../utils/actions/postActions";
import {
    launchImagePicker,
    uploadImageAsync,
} from "../utils/imagePickerHelper";
import {
    launchDocumentPicker,
    uploadDocumentAsync,
} from "../utils/launchDocumentPicker";

const CreatePostScreen = ({ navigation }) => {
  const [tempImages, setTempImages] = useState([]);
  const [tempDocs, setTempDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const userData = useSelector((state) => state.auth.userData);
  const [postTitle, setPostTitle] = useState("");
  const [postText, setPostText] = useState("");
  const scrollViewRef = useRef(null);
  const scrollY = useRef(0);

  const pickImage = useCallback(async () => {
    try {
      const tempUri = await launchImagePicker();
      if (!tempUri) return;
      setTempImages((prevImages) => [...prevImages, tempUri]);
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  const uploadImages = useCallback(async () => {
    try {
      const uploadPromises = tempImages.map((imageUri) =>
        uploadImageAsync(imageUri, true)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.log(error.message);
    }
  }, [tempImages]);

  const pickDocument = useCallback(async () => {
    try {
      const documentInfo = await launchDocumentPicker();
      if (!documentInfo) return;
      const { name, uri } = documentInfo;
      setTempDocs((prevDocs) => [...prevDocs, { name, uri }]);
    } catch (error) {
      console.log(error.message);
    }
  }, [tempDocs]);

  const handleDeleteImage = (index) => {
    console.log("Deleting image at index:", index);

    const updatedImages = [...tempImages];
    updatedImages.splice(index, 1);
    setTempImages(updatedImages);
  };

  const handleDeleteDocument = (index) => {
    console.log("Deleting image at index:", index);

    const updatedDocs = [...tempDocs];
    updatedDocs.splice(index, 1);
    setTempDocs(updatedDocs);
  };

  const uploadDocuments = useCallback(async () => {
    try {
      const uploadPromises = tempDocs.map((doc) =>
        uploadDocumentAsync(doc.uri, true)
      );
      const documentUrls = await Promise.all(uploadPromises);

      const uploadedDocs = tempDocs.map((doc, index) => ({
        name: doc.name,
        uri: documentUrls[index],
      }));

      return uploadedDocs;
    } catch (error) {
      console.log(error.message);
      return [];
    }
  }, [tempDocs]);


  const handlePost = async () => {
    setIsLoading(true);
    let imageUrls = [],
      documentUrls = [];
    if (tempImages.length > 0) {
      imageUrls = await uploadImages();
    }
    if (tempDocs.length > 0) {
      documentUrls = await uploadDocuments();
    }

    await createPost(
      userData.userId,
      postTitle,
      postText,
      imageUrls,
      documentUrls
    );

    setPostTitle("");
    setPostText("");
    setTempImages([]);
    setTempDocs([]);
    setIsLoading(false);
    navigation.goBack();
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>New Post</Text>
          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={pickImage}>
              <Ionicons name="image" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={pickDocument}>
              <Ionicons name="document" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <TextInput
          style={styles.titleInput}
          placeholder="Write the title here"
          value={postTitle}
          onChangeText={(text) => setPostTitle(text)}
        />
        <FlatList
          data={[
            { key: "input" },
            ...tempImages.map((uri, index) => ({
              key: uri,
              type: "image",
              index,
            })),
            ...tempDocs.map((doc, index) => ({
              key: doc.uri,
              type: "doc",
              name: doc.name,
              index,
            })),
          ]}
          renderItem={({ item }) => {
            if (item.key === "input") {
              return (
                <TextInput
                  style={styles.textInput}
                  placeholder="Write your post here"
                  value={postText}
                  onChangeText={(text) => setPostText(text)}
                  multiline
                />
              );
            } else if (item.type === "image") {
              return (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: item.key }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteImage(item.index)}
                  >
                    <AntDesign
                      name="closecircle"
                      size={18}
                      color={colors.red}
                    />
                  </TouchableOpacity>
                </View>
              );
            } else if (item.type === "doc") {
              return (
                <View style={styles.documentContainer}>
                  <Ionicons name="document-outline" size={30} color="black" />
                  <Text style={styles.documentName}>{item.name}</Text>
                  <TouchableOpacity
                    style={styles.deleteDocButton}
                    onPress={() => handleDeleteDocument(item.index)}
                  >
                    <AntDesign
                      name="closecircle"
                      size={18}
                      color={colors.red}
                    />
                  </TouchableOpacity>
                </View>
              );
            }
          }}
          ListFooterComponent={() => null}
        />

        {!isLoading && (
          <TouchableOpacity style={styles.postButton} onPress={handlePost}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        )}
        {isLoading && <ActivityIndicator size="small" />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  closeButton: {
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  titleInput: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 5,
    width: "100%",
    minHeight: 50,
    padding: 10,
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 5,
    width: "100%",
    minHeight: 500,
    padding: 10,
    marginBottom: 10,
  },
  iconContainer: {
    flexDirection: "row",
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  docName: {
    marginBottom: 5,
  },
  postButton: {
    backgroundColor: colors.primary,
    width: "40%",
    padding: 10,
    alignItems: "center",
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 20,
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  documentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderColor: colors.lightGrey,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  documentName: {
    flex: 1,
    fontSize: 16,
    color: colors.primary,
  },

  deleteDocButton: {
    marginLeft: 10,
  },
  imageWrapper: {
    position: "relative",
    marginBottom: 10,
  },

  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1,
    backgroundColor: "transparent",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    borderColor: colors.lightGrey,
    borderWidth: 1,
    position: "relative",
  },
});

export default CreatePostScreen;
