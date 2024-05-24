import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Button,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import PageContainer from "../components/PageContainer";
import PostItem from "../components/PostItem";
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

const Timeline = (props) => {
  const [tempImageUri, setTempImageUri] = useState("");
  const [tempDocUri, setTempDocUri] = useState("");
  const [tempDocName, setTempDocName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const userData = useSelector((state) => state.auth.userData);
  const [modalVisible, setModalVisible] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postText, setPostText] = useState("");
  const scrollViewRef = useRef(null);
    const scrollY = useRef(0);

  const storedPosts = useSelector((state) => {
    const postsData = state.posts.postsData;
    return Object.values(postsData).sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  });

  const pickImage = useCallback(async () => {
    try {
      const tempUri = await launchImagePicker();
      if (!tempUri) return;

      setTempImageUri(tempUri);
    } catch (error) {
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
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
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
    }
  }, [tempDocUri, tempDocName]);

  const uploadImage = useCallback(async () => {
    try {
      const uploadUrl = await uploadImageAsync(tempImageUri, true);
      return uploadUrl;
    } catch (error) {
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
    }
  });

  const uploadDocument = useCallback(async () => {
    try {
      const uploadUrl = await uploadDocumentAsync(tempDocUri, true);
      return uploadUrl;
    } catch (error) {
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
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

    setPostTitle("");
    setPostText("");
    setTempImageUri(null);
    setTempDocUri(null);
    setIsLoading(false);
    setModalVisible(false);
  };
  
  const handleScroll = event => {
    scrollY.current = event.nativeEvent.contentOffset.y;
};

const restoreScrollPosition = () => {
    if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: scrollY.current, animated: false });
    }
};

  return (
    <PageContainer>
      <Text style={styles.title}>Timeline</Text>
      {userData.selectedRole === "facultyMember" && (
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
          <View style={styles.modalContent}>
            <View style={styles.closeButton}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons
                  name="close-circle-outline"
                  size={24}
                  color="#001962"
                />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.titleInput}
              placeholder="Write the title here"
              value={postTitle}
              onChangeText={(text) => setPostTitle(text)}
            />
            <ScrollView style={styles.scrollView}
            ref={scrollViewRef}
            onScroll={handleScroll}
            onContentSizeChange={restoreScrollPosition}>
              <TextInput
                style={styles.textInput}
                placeholder="Write your announcement here"
                value={postText}
                onChangeText={(text) => setPostText(text)}
                multiline
              />
            </ScrollView>

            <View style={styles.testContainer}>
              <View style={styles.iconContainer}>
                <TouchableOpacity onPress={pickImage}>
                  <Ionicons name="image" size={24} color="#001962" />
                </TouchableOpacity>
                <TouchableOpacity onPress={pickDocument}>
                  <Ionicons name="document" size={24} color="#001962" />
                </TouchableOpacity>
              </View>

              {!isLoading && (
                <View style={styles.button}>
                  <Button title="Post" color="white" onPress={handlePost} />
                </View>
              )}
              {isLoading && (
                <ActivityIndicator size="small" style={styles.loading} />
              )}
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={storedPosts}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              props.navigation.navigate("PostDetails", {
                post: item,
              })
            }
          >
            <PostItem
              key={item.key}
              postTitle={item.title}
              postText={item.text}
              updatedAt={item.updatedAt}
            />
          </TouchableOpacity>
        )}
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  newAnnouncement: {
    fontSize: 18,
    color: colors.primary,
    textDecorationLine: "underline",
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 15,
    paddingTop: 5,
    borderRadius: 10,
    width: "80%",
  },
  titleInput: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    width: "100%",
    minHeight: 50,
    padding: 10,
    marginBottom: 5,
    marginTop: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    width: "100%",
    minHeight: 150,
    padding: 10,
    marginBottom: 10,
    marginTop: 5,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    width: "30%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  loading: {
    color: colors.primary,
    width: "50%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "right",
    justifyContent: "flex-end",
    color: colors.primary,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginRight: "53%",
  },
  testContainer: {
    flexDirection: "row",
  },
  scrollView: {
    maxHeight: 200,
  },
});

export default Timeline;
