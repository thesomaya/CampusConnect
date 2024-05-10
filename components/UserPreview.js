import { AntDesign } from '@expo/vector-icons';
import { faInfoCircle, faTrashAlt, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { isAdmin } from '../utils/actions/chatActions';
import ProfileImage from './ProfileImage';

const imageSize = 40;

const UserPreview = ({ userData, LoggedInUser, name, image, chatData, onPressInfo, onPressMakeAdmin, onPressRemove, onClose }) => {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [LoggedInIsAdmin, setLoggedInIsAdmin] = useState(false);

  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const adminStatus = await isAdmin(userData, chatData);
        const loggedInStatus = await isAdmin(LoggedInUser, chatData);
        setIsAdminUser(adminStatus);
        setLoggedInIsAdmin(loggedInStatus);
      } catch (error) {
        console.error("Error fetching admin status:", error);
      }
    };

    fetchAdminStatus();
  }, [userData, chatData]);


  const adminText = isAdminUser ? "Remove group admin" : "Make group admin";

  return (
    <Modal animationType="none" transparent visible={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
            <View style={styles.nameContainer}>
            <ProfileImage 
                uri={image}
                size={imageSize}
                />
            <Text style={styles.name}>{name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <AntDesign name="closecircleo" size={24} color="black" />
            </TouchableOpacity>
            </View>
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={onPressInfo} style={styles.action}>
              <FontAwesomeIcon icon={faInfoCircle} size={20} color="black" />
              <Text style={styles.actionText}>Info</Text>
            </TouchableOpacity>
            { LoggedInIsAdmin &&
            <TouchableOpacity onPress={onPressMakeAdmin} style={styles.action}>
              <FontAwesomeIcon icon={faUserShield} size={20} color="black" />
              <Text style={styles.actionText}>{adminText}</Text>
            </TouchableOpacity>
            }
            { LoggedInIsAdmin &&
            <TouchableOpacity onPress={onPressRemove} style={styles.action}>
              <FontAwesomeIcon icon={faTrashAlt} size={18} color="black" />
              <Text style={styles.actionText}>Remove from Group</Text>
            </TouchableOpacity> 
            }
          </View>
          
        </View>
      </View>

    </Modal>
  );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      width: '100%', // Take up all the screen width
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center', // Align items horizontally
      },
    name: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionsContainer: {
      width: '100%',
      marginTop: 10, // Add some margin between name and actions
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10, // Add padding to create space between actions
      borderBottomWidth: 1, // Add border to create a thin grey line
      borderBottomColor: '#ccc', // Grey color for the line
    },
    actionText: {
      marginLeft: 5,
    },
    closeButton: {
        position: 'absolute',
        right: 10,
      },
  });
  
  export default UserPreview;
  