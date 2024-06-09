import {
  AntDesign,
  Feather,
  FontAwesome,
  Ionicons
} from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import uuid from "react-native-uuid";
import { useSelector } from "react-redux";
import colors from "../constants/colors";
import {
  deleteMessageforAll,
  deleteMessageforUser,
  starMessage,
} from "../utils/actions/chatActions";
import { openPDF, openPowerPoint, openWord } from "../utils/openFiles";

function formatTime(dateString) {
  const date = new Date(dateString);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return hours + ":" + minutes + " " + ampm;
}

const MenuItem = (props) => {
  const Icon = props.iconPack ?? Feather; // default to Feather if no iconPack was passed

  return (
    <MenuOption onSelect={props.onSelect}>
      <View style={styles.menuItemContainer}>
        <Text style={styles.menuText}>{props.text}</Text>
        <Icon name={props.icon} size={18} />
      </View>
    </MenuOption>
  );
};

const Bubble = (props) => {
  const {
    text,
    type,
    isDeleted,
    isAdmin,
    messageId,
    chatId,
    userId,
    date,
    setReply,
    replyingTo,
    name,
    imageUrl,
    documentUrl,
  } = props;
  const starredMessages = useSelector(
    (state) => state.messages.starredMessages[chatId] ?? {}
  );
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const bubbleStyle = { ...styles.container };
  const textStyle = { ...styles.text };
  const wrapperStyle = { ...styles.wrapperStyle };

  const menuRef = useRef(null);
  const id = useRef(uuid.v4());

  let Container = View;
  let isUserMessage = false;
  const dateString = date && formatTime(date);
  switch (type) {
    case "system":
      textStyle.color = "#65644A";
      bubbleStyle.backgroundColor = colors.beige;
      bubbleStyle.alignItems = "center";
      bubbleStyle.marginTop = 10;
      break;
    case "error":
      bubbleStyle.backgroundColor = colors.red;
      textStyle.color = "white";
      bubbleStyle.marginTop = 10;
      break;
    case "myMessage":
      wrapperStyle.justifyContent = "flex-end";
      bubbleStyle.backgroundColor = "#E7FED6";
      bubbleStyle.maxWidth = "90%";
      Container = TouchableWithoutFeedback;
      isUserMessage = true;
      break;
    case "theirMessage":
      wrapperStyle.justifyContent = "flex-start";
      bubbleStyle.maxWidth = "90%";
      Container = TouchableWithoutFeedback;
      isUserMessage = true;
      break;
    case "reply":
      bubbleStyle.backgroundColor = "#d7f2c9";
      break;
    case "info":
      bubbleStyle.backgroundColor = "white";
      bubbleStyle.alignItems = "center";
      textStyle.color = colors.textColor;
      break;

    default:
      break;
  }

  const copyToClipboard = async (text) => {
    try {
      await Clipboard.setStringAsync(text);
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenDocument = async (documentURL) => {
    try {
      // Check the document type and open accordingly
      if (text.endsWith(".pdf")) {
        // Use PDF viewer
        await openPDF(documentURL);
      } else if (text.endsWith(".docx") || documentURL.endsWith(".doc")) {
        // Use Word viewer
        await openWord(documentURL);
      } else if (text.endsWith(".pptx") || documentURL.endsWith(".ppt")) {
        // Use PowerPoint viewer
        await openPowerPoint(documentURL);
      } else {
        // Use default viewer for other document types
        await Linking.openURL(documentURL);
      }
    } catch (error) {
      console.log("Error opening document:", error);
    }
  };

  const isLink =
    text.startsWith("http") ||
    text.startsWith("https") ||
    text.startsWith("exp");

  const handleOpenURL = async (url) => {
    const supported = await Linking.canOpenURL(url);
  };

  const isStarred = isUserMessage && starredMessages[messageId] !== undefined;
  const replyingToUser = replyingTo && storedUsers[replyingTo.sentBy];
  
  const [imageSize, setImageSize] = useState(null);

  useEffect(() => {
    if (imageUrl) {
      Image.getSize(
        imageUrl,
        (width, height) => {
          const aspectRatio = width / height;
          const maxWidth = 500;
          const maxHeight = 500;
          let finalWidth = width;
          let finalHeight = height;

          if (width > maxWidth) {
            finalWidth = maxWidth;
            finalHeight = maxWidth / aspectRatio;
          }
          if (finalHeight > maxHeight) {
            finalHeight = maxHeight;
            finalWidth = maxHeight * aspectRatio;
          }
          setImageSize({ width: finalWidth, height: finalHeight });
        },
        (error) => {
          console.log("Error getting image size:", error);
        }
      );
    }
  }, [imageUrl]);

  return (
    <View style={wrapperStyle}>
      <Container
        onLongPress={() =>
          menuRef.current.props.ctx.menuActions.openMenu(id.current)
        }
        style={{ width: "100%" }}
      >
        <View style={bubbleStyle}>
          {name && type !== "info" && <Text style={styles.name}> {name} </Text>}

          {replyingToUser && (
            <Bubble
              type="reply"
              text={replyingTo.text}
              name={`${replyingToUser.firstLast}`}
            />
          )}

          {!documentUrl && !imageUrl && !isLink && !isDeleted && (
            <Text style={textStyle}>{text}</Text>
          )}
          {isDeleted && (
            <View style={styles.deletedContainer}>
              <AntDesign name="exclamationcircleo" size={17} color="grey" />
              <Text style={styles.deletedText}> This message was deleted</Text>
            </View>
          )}
          {!documentUrl && !imageUrl && isLink && (
            <Text style={styles.link} onPress={() => handleOpenURL(text)}>
              {text}
            </Text>
          )}

          {imageUrl && imageSize && !isDeleted &&(
            <Image
              source={{ uri: imageUrl }}
              style={[styles.image, { width: imageSize.width, height: imageSize.height }]}
              resizeMode="contain"
            />
          )}
          {!isDeleted && imageUrl && !imageSize && <ActivityIndicator size="large" color={colors.blue} />}
          {!imageUrl && documentUrl && !isDeleted && (
            <TouchableOpacity onPress={() => handleOpenDocument(documentUrl)}>
              <View style={styles.documentContainer}>
                <Ionicons
                  name="document-outline"
                  size={40}
                  color={colors.blue}
                  style={styles.documentIcon}
                />
                <View style={styles.documentInfo}>
                  <Text style={styles.text}>{text}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {dateString && type !== "info" && (
            <View style={styles.timeContainer}>
              {isStarred && (
                <FontAwesome
                  name="star"
                  size={11}
                  color={colors.grey}
                  style={{ marginRight: 2, marginTop: 2 }}
                />
              )}
              <Text style={styles.time}> {dateString} </Text>
            </View>
          )}

          <Menu name={id.current} ref={menuRef}>
            <MenuTrigger />

            <MenuOptions>
              <MenuItem
                text="Copy to clipboard"
                icon={"copy"}
                onSelect={() => copyToClipboard(text)}
              />
              <MenuItem
                text={`${isStarred ? "Unstar" : "Star"} message`}
                icon={isStarred ? "star" : "star-o"}
                iconPack={FontAwesome}
                onSelect={() => starMessage(messageId, chatId, userId)}
              />
              <MenuItem
                text="Reply"
                icon="arrow-undo-outline"
                iconPack={Ionicons}
                onSelect={setReply}
              />
              {
                <MenuItem
                  text="Delete for Me"
                  icon="delete"
                  iconPack={AntDesign}
                  onSelect={() =>
                    deleteMessageforUser(userId, chatId, messageId)
                  }
                />
              }
              {(type === "myMessage" || isAdmin) &&(
                <MenuItem
                  text="Delete for All"
                  icon="delete"
                  iconPack={AntDesign}
                  onSelect={() => deleteMessageforAll(userId, chatId, messageId)}
                />
              )}
            </MenuOptions>
          </Menu>
        </View>
      </Container>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapperStyle: {
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    backgroundColor: "white",
    borderRadius: 6,
    padding: 5,
    marginBottom: 10,
    borderColor: "#E2DACC",
    borderWidth: 1,
    maxWidth: '100%',  // Ensure the container can expand to its parent's width
  },
  text: {
    fontFamily: "regular",
    letterSpacing: 0.3,
  },
  deletedText: {
    color: "grey",
    fontFamily: "regular",
    letterSpacing: 0.3,
    fontStyle: "italic",
  },
  menuItemContainer: {
    flexDirection: "row",
    padding: 5,
  },
  menuText: {
    flex: 1,
    fontFamily: "regular",
    letterSpacing: 0.3,
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  time: {
    fontFamily: "regular",
    letterSpacing: 0.3,
    color: colors.grey,
    fontSize: 12,
  },
  name: {
    fontFamily: "medium",
    letterSpacing: 0.3,
    color: "#a29ea7",
    marginLeft: -4,
    marginBottom: 2,
  },
  image: {
    width: '100%',  // Ensure the image scales correctly
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  link: {
    color: colors.blue,
    fontFamily: "regular",
    letterSpacing: 0.3,
    textDecorationLine: "underline",
  },
  documentContainer: {
    alignItems: "center",
  },
  documentIcon: {
    marginRight: 10,
  },
  documentInfo: {
    flex: 1,
  },
  deletedContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Bubble;
