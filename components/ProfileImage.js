import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import userImage from "../assets/images/defaultimage.png";

import colors from "../constants/colors";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { launchImagePicker, uploadImageAsync } from "../utils/imagePickerHelper";
import { updateSignedInUserData } from "../utils/actions/authActions";
import { updateLoggedInUserData } from "../store/authSlice";
import { useDispatch } from "react-redux";


const ProfileImage = (props) => {
  const dispatch = useDispatch();

  const source = props.uri ? { uri: props.uri } : userImage;

  const [image, setImage] = useState(source);
  const [isLoading, setIsLoading] = useState(false);

  const showEditButton = props.showEditButton && props.showEditButton === true; // check if the property is passed in and if it's true
  const showRemoveButton = props.showRemoveButton && props.showRemoveButton === true; // check if the property is passed in and if it's true

  const userId = props.userId;

  const pickImage = async () => {
    try {
      const tempUri = await launchImagePicker();

      if (!tempUri) return;

      setIsLoading(true);
      const uploadUrl = await uploadImageAsync(tempUri);
      setIsLoading(false);

      if (!uploadUrl) {
        throw new Error("Could not upload image.");
      }
      const newData = { profilePicture: uploadUrl };

      await updateSignedInUserData(userId, newData);
      dispatch(updateLoggedInUserData({ newData }));
      setImage({ uri: uploadUrl });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const Container = props.onPress || showEditButton ? TouchableOpacity : View;
  return (
    <Container style={props.style} onPress={props.onPress || pickImage}>
      {isLoading ? (
        <View
          height={props.size}
          width={props.size}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size={"small"} color={colors.primary} />
        </View>
      ) : (
        <Image
          style={{
            ...styles.image,
            ...{ height: props.size, width: props.size },
          }}
          source={image}
        />
      )}

      {
        showEditButton && !isLoading && 
        <View style={styles.editIconContainer}>
          <FontAwesome name="pencil" size={15} color="black" />
        </View>
      
      }

      {
        showRemoveButton && !isLoading && 
        <View style={styles.removeIconContainer}>
          <Ionicons name="close" size={15} color="white" />        
        </View>
      
      }

    </Container>
  );
};

const styles = StyleSheet.create({
  image: {
    borderRadius: 50,
    borderColor: colors.grey,
    borderWidth: 1,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: -12,
    backgroundColor: colors.lightGrey,
    borderRadius: 20,
    padding: 8,
  },
  removeIconContainer: {
    position: "absolute",
    bottom: -3,
    right: -3,    
    backgroundColor: colors.grey,
    borderRadius: 20,
    padding: 3,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  }
});

export default ProfileImage;
