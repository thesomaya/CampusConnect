import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { format } from "date-fns";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useLayoutEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import colors from "../constants/colors";
import { deletePost, updatePost } from "../utils/actions/postActions";
const PostDetails = ({ route }) => {
  const { post } = route.params;
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post.title);
  const [editedText, setEditedText] = useState(post.text);
  const userData = useSelector((state) => state.auth.userData);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Post Details',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} style={{ marginLeft: 15 }} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        userData.selectedRole === "facultyMember" && (
          <View style={{ flexDirection: 'row' }}>
            {!isEditing && (
              <TouchableOpacity onPress={handleEdit}>
                <Ionicons name="create-outline" size={24} color={colors.primary} style={{ marginRight: 15 }} />
              </TouchableOpacity>
            )}
            {isEditing && (
              <TouchableOpacity onPress={() => handleSave(editedTitle,editedText)}>
                <Ionicons name="save-outline" size={24} color={colors.primary} style={{ marginRight: 15 }} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color="#e74c3c" style={{ marginRight: 15 }}/>
            </TouchableOpacity>
            
          </View>
        )
      ),
    });
  }, [navigation, isEditing, editedText, editedTitle]);

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
    try {
      const newData = {
        title: editedTitle,
        text: editedText,
        updatedAt: new Date().toISOString(),
      };
      await updatePost(post.postId, newData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDownload = async () => {
    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        post.docUrl,
        FileSystem.documentDirectory + "downloadedDocument"
      );
      const { uri } = await downloadResumable.downloadAsync();

      if (uri) {
        await Sharing.shareAsync(uri);
      } else {
        console.error("Failed to download document.");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
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
      </ScrollView>
      <View style={styles.separator} />
      <View style={styles.dateTimeContainer}>
        <Text style={styles.dateText}>Updated At </Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      {/* {isEditing && (
        <TouchableOpacity onPress={() => handleSave()} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      )} */}
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
    color: colors.primary
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  downloadText: {
    fontWeight: "bold",
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
    color: colors.primary

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
  saveButton: {
    backgroundColor: colors.primary,
    padding: 5,
    width: "40%",
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    alignSelf: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PostDetails;
