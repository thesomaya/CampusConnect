import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import { useSelector } from "react-redux";
import colors from "../constants/colors";
import { deletePost, getPostCreatorName, updatePost } from "../utils/actions/postActions";
import {
  launchImagePicker,
  uploadImageAsync,
} from "../utils/imagePickerHelper";
import {
  launchDocumentPicker,
  uploadDocumentAsync,
} from "../utils/launchDocumentPicker";

const PostDetails = ({ route }) => {
  const { post } = route.params;
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post.title);
  const [editedText, setEditedText] = useState(post.text);
  const [editedImages, setEditedImages] = useState(post.imageUrl ? [...post.imageUrl] : []);
  const [editedDocs, setEditedDocs] = useState(post.docUrl ? [...post.docUrl] : []);
  const [name, setName] = useState("");

  const [fullScreenImage, setFullScreenImage] = useState(null);

  const userData = useSelector((state) => state.auth.userData);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Post Details",
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.primary}
            style={{ marginLeft: 15 }}
          />
        </TouchableOpacity>
      ),
      headerRight: () =>
        userData.selectedRole === "facultyMember" && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {isEditing && (
              <Menu>
                <MenuTrigger>
                  <AntDesign
                    name="plus"
                    size={24}
                    color={colors.primary}
                    style={{ marginRight: 15 }}
                  />
                </MenuTrigger>
                <MenuOptions>
                  <MenuOption onSelect={handleImageUpload}>
                    <Text style={styles.menuOptionText}>Upload Image</Text>
                  </MenuOption>
                  <MenuOption onSelect={handleDocumentUpload}>
                    <Text style={styles.menuOptionText}>Upload Document</Text>
                  </MenuOption>
                </MenuOptions>
              </Menu>
            )}
            {isEditing ? (
              <TouchableOpacity onPress={handleSave}>
                <Ionicons
                  name="save-outline"
                  size={24}
                  color={colors.primary}
                  style={{ marginRight: 15 }}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleEdit}>
                <Ionicons
                  name="create-outline"
                  size={24}
                  color={colors.primary}
                  style={{ marginRight: 15 }}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons
                name="trash-outline"
                size={24}
                color="#e74c3c"
                style={{ marginRight: 15 }}
              />
            </TouchableOpacity>
          </View>
        ),
    });
  }, [
    navigation,
    isEditing,
    editedText,
    editedTitle,
    editedImages,
    editedDocs,
  ]);

  const handleFullScreenImage = (uri) => {
    setFullScreenImage(uri);
  };

  const handleFullScreenClose = () => {
    setFullScreenImage(null);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePost(post.postId);
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting post:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const validImages = editedImages.filter((image) => image);
    const validDocs = editedDocs.filter((doc) => doc);
    try {
      const newData = {
        title: editedTitle,
        text: editedText,
        imageUrl: validImages,
        docUrl: validDocs,
        updatedAt: new Date().toISOString(),
      };
      await updatePost(post.postId, newData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDownload = async (uri) => {
    try {
      const downloadResumable = FileSystem.createDownloadResumable(uri, FileSystem.documentDirectory + "downloadedFile");
      const response = await fetch(uri); // Fetching the file to get its headers
      const contentType = response.headers.get("Content-Type");
      const extension = contentType.split("/").pop(); // Extracting extension from Content-Type
  
      const { uri: localUri } = await downloadResumable.downloadAsync();
      const newLocalUri = `${localUri}.${extension}`; // Adding extension to localUri
  
      await FileSystem.moveAsync({
        from: localUri,
        to: newLocalUri,
      });
  
      if (newLocalUri) {
        await Sharing.shareAsync(newLocalUri);
      } else {
        console.error("Failed to download document.");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };
  
  const handleDeleteImage = (index) => {
    const updatedImages = [...editedImages];
    updatedImages.splice(index, 1);
    setEditedImages(updatedImages);
  };

  useEffect (() => {
    const postCreatorName = async () => {
      const name = await getPostCreatorName(post.createdBy);
      setName(name);
    };
    postCreatorName();
  }, [post]);
  

  const handleDeleteDocument = (index) => {
    const updatedDocs = [...editedDocs];
    updatedDocs.splice(index, 1);
    setEditedDocs(updatedDocs);
  };

  const handleImageUpload = async () => {
    try {
      const tempUri = await launchImagePicker();
      if (!tempUri) return;

      const uploadUrl = await uploadImageAsync(tempUri, true);
      if (!uploadUrl) return;

      setEditedImages((prevImages) =>
        prevImages ? [...prevImages, uploadUrl] : [uploadUrl]
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDocumentUpload = async () => {
    try {
      const documentInfo = await launchDocumentPicker();
      if (!documentInfo) return;

      const { name, uri } = documentInfo;

      const uploadUrl = await uploadDocumentAsync(uri, true);
      if (!uploadUrl) return;

      setEditedDocs((prevDocs) =>
        prevDocs
          ? [...prevDocs, { uri: uploadUrl, name }]
          : [{ uri: uploadUrl, name }]
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  const formattedDate = format(new Date(post.updatedAt), "dd.MM.yyyy HH:mm");

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.title, isEditing && styles.titleInput]}
        value={editedTitle}
        onChangeText={setEditedTitle}
        editable={isEditing}
        placeholder="Title"
      />
      <View style={styles.separator} />
      <ScrollView>
        <TextInput
          style={[styles.text, isEditing && styles.textInput]}
          value={editedText}
          onChangeText={setEditedText}
          editable={isEditing}
          placeholder="Content"
          multiline
        />
        <View style={styles.imageGrid}>
          {editedImages &&
            editedImages.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <TouchableOpacity onPress={() => handleFullScreenImage(uri)}>
                  <View style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.image} />
                    {isEditing && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteImage(index)}
                      >
                        <AntDesign
                          name="closecircle"
                          size={18}
                          color={colors.red}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))}
        </View>
        {fullScreenImage && (
          <View style={styles.fullScreenImageContainer}>
            <TouchableOpacity
              style={styles.fullScreenCloseButton}
              onPress={handleFullScreenClose}
            >
              {/* <Ionicons name="close-circle" size={30} color={colors.white} /> */}
            </TouchableOpacity>
            <Image
              source={{ uri: fullScreenImage }}
              style={styles.fullScreenImage}
            />
          </View>
        )}
        {editedDocs &&
          editedDocs.map((doc, index) => (
            <View key={index} style={styles.documentContainer}>
                <Ionicons name="document-outline" size={30} color="black" />

                <Text style={styles.documentName}>{doc.name}</Text>
                <TouchableOpacity onPress={() => handleDownload(doc.uri)}>

                <Ionicons
                  name="cloud-download-outline"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
              <View style={styles.documentActions}>
                {isEditing && (
                  <TouchableOpacity
                    style={styles.deleteDocButton}
                    onPress={() => handleDeleteDocument(index)}
                  >
                    <AntDesign
                      name="closecircle"
                      size={18}
                      color={colors.red}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
      </ScrollView>
      <View style={styles.separator} />
      <View style={styles.dateTimeContainer}>
        <Text style={styles.dateText}>Posted By </Text>
        <Text style={styles.date}>{name}</Text>
      </View>
      <View style={styles.dateTimeContainer}>
        <Text style={styles.dateText}>Updated At </Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 10,
    flex: 1,
    color: colors.primary,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  imageWrapper: {
    width: "48%",
    marginBottom: 10,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    borderColor: colors.lightGrey,
    borderWidth: 1,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  downloadContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  downloadText: {
    textDecorationLine: "underline",
    marginRight: 10,
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 16,
    marginBottom: 10,
    color: colors.primary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.lightGrey,
    width: "100%",
    marginVertical: 10,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 5,
    padding: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 5,
    padding: 10,
    minHeight: 200,
  },
  deleteButton: {
    position: "absolute",
    right: 5,
    top: 5,
    backgroundColor: "transparent",
  },
  fullScreenImageContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    flex: 1,
    width: "100%",
    resizeMode: "contain",
  },
  fullScreenCloseButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuOptionText: {
    fontSize: 16,
    padding: 10,
  },
  documentThumbnail: {
    width: 50,
    height: 50,
    marginRight: 10,
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
  documentActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteDocButton: {
    marginLeft: 10,
  },
});

export default PostDetails;
