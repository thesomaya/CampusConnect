import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import courseImage from '../assets/images/courseimage.png';
import colors from '../constants/colors';



const CourseItem = ({ title, subTitle, creatorName, lecturer, image, onPress }) => {

    const source = image ?  {uri : image}  : courseImage;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={source} style={styles.image} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.lecturer}>Lecturer: {creatorName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingVertical: 4,
    borderColor: colors.grey,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white, // Set background color for card effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84, // Adjust shadow properties for card effect
    elevation: 5, // Additional elevation for card effect (optional)
    borderRadius: 10, // Add rounded corners for card effect
    borderBottomWidth: 0.5,
    paddingBottom: 5,
    borderColor: colors.grey,
  },
  imageContainer: {
    width: '40%', // Adjust width based on your desired image size
    alignItems: 'center',
    paddingStart: 7,
  },
  image: {
    width: '100%',
    height: 80,
  },
  textContainer: {
    flex: 1,
    padding: 5, // Add padding for content within the card
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.grey,
  },
  lecturer: {
    color: colors.grey,
  },
  subTitle: {
    color: colors.grey,
  },
});

export default CourseItem;
