import { format } from "date-fns";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const PostItem = (props) => {
  const { postTitle, postText, updatedAt } = props;
  const formattedDate = format(new Date(updatedAt), "dd.MM.yyyy");
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{postTitle}</Text>
      <Text style={styles.date}>{formattedDate}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
  },
  dateTimeContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  date: {
    fontSize: 12,
    justifyContent: "flex-end",
  },
});

export default PostItem;
