import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";
import { useSelector } from "react-redux";
import PageContainer from "../components/PageContainer";
import PostItem from "../components/PostItem";
import colors from "../constants/colors";

const Timeline = (props) => {
  const userData = useSelector((state) => state.auth.userData);
  const storedPosts = useSelector((state) => {
    const postsData = state.posts.postsData;
    return Object.values(postsData).sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  });
  
  return (
    <PageContainer>
      <Text style={styles.title}>Timeline</Text>
      {userData.selectedRole === "facultyMember" && (
        <TouchableOpacity onPress={() => props.navigation.navigate('CreatePost')}>
        <Text style={styles.newAnnouncement}>New Announcement</Text>
      </TouchableOpacity>
      )}

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
    width: "90%",
    maxHeight: "95%",
    height: "auto",
  },
  titleInput: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 5,
    width: "100%",
    minHeight: 50,
    padding: 10,
    marginBottom: 5,
    marginTop: 5,
    color: "black",
    placeholderTextColor: "black",
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 5,
    width: "100%",
    minHeight: 200,
    padding: 10,
    marginBottom: 10,
    marginTop: 5,
    color: "black",
    placeholderTextColor: "black",
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
    maxHeight: 300,
  },
});

export default Timeline;
