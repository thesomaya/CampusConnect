import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import DataItem from '../components/DataItem';
import GroupItem from '../components/GroupItem';
import PageContainer from '../components/PageContainer';
import UserPreview from "../components/UserPreview";
import {
    addAdmin,
    isAdmin,
    removeAdmin,
    removeUserFromChat
} from "../utils/actions/chatActions";

const DataListScreen = props => {

    const [showUserPreview, setShowUserPreview] = useState(false);
    const [selectedUser, setSelectedUser] = useState();
    const [userAdmins, setUserAdmins] = useState({}); // State for user admin status
    const [isAdminUser, setIsAdminUser] = useState();

    const storedUsers = useSelector(state => state.users.storedUsers);
    const userData = useSelector(state => state.auth.userData);
    const messagesData = useSelector(state => state.messages.messagesData);
    
    const { title, data, type, chatId, chatData } = props.route.params;

    const handleGroupItemPress = async (user) => {
        setSelectedUser(user);
        setShowUserPreview(true);
        const isGroupAdmin = await isAdmin(user, chatData);
        setIsAdminUser(isGroupAdmin);
    };

    // Function to fetch admin status
    const fetchAdminStatus = async (user) => {
        try {
            const isAdminValue = await isAdmin(user, chatData);
            setUserAdmins((prevAdmins) => ({ ...prevAdmins, [user.userId]: isAdminValue }));
        } catch (error) {
            console.error("Error fetching admin status:", error);
        }
    };

    // Effect to fetch admin status when component mounts or user data changes
    useEffect(() => {
        // Ensure storedUsers and data are available
        if (!storedUsers || !data) return;

        // Fetch admin status for each user
        data.forEach((uid) => {
            const currentUser = storedUsers[uid];
            if (currentUser) {
                fetchAdminStatus(currentUser);
            }
        });
    }, [storedUsers, data]);

    const handleGroupItemClose = () => {
        setSelectedUser(null);
        setShowUserPreview(false);
    };
    
    useEffect(() => {
        props.navigation.setOptions({ headerTitle: title })
    }, [title])

    const renderListItem = ({ item }) => {
        let key, onPress, image, title, subTitle, itemType;

        if (type === "users") {
            const currentUser = storedUsers[item];
            if (!currentUser) return null;

            const isLoggedInUser = item === userData.userId;

            key = item;
            image = currentUser.profilePicture;
            title = `${currentUser.firstName} ${currentUser.lastName}`;
            subTitle = currentUser.about;
            itemType = isLoggedInUser ? undefined : "link";
            onPress = isLoggedInUser ? undefined : () => handleGroupItemPress(currentUser)
        } else if (type === "messages") {
            const { chatId, messageId } = item;
            const messagesForChat = messagesData[chatId];

            if (!messagesForChat) {
                return null;
            }

            const messageData = messagesForChat[messageId];
            const sender = messageData.sentBy && storedUsers[messageData.sentBy];
            const name = sender && `${sender.firstName} ${sender.lastName}`;

            key = messageId;
            title = name;
            subTitle = messageData.text;
            itemType = "";
            onPress = () => {}
        }

        const currentAdmin = userAdmins[item];
        return type === "users" ? (
            <GroupItem
                key={key}
                onPress={onPress}
                image={image}
                title={title}
                subTitle={subTitle}
                type={itemType}
                admin={currentAdmin}
            />
        ) : (
            <DataItem
                key={key}
                onPress={onPress}
                image={image}
                title={title}
                subTitle={subTitle}
                type={itemType}
            />
        )
    };

    return (
        <PageContainer>
            <FlatList
                data={data}
                keyExtractor={(item, index) => item.messageId || index.toString()}
                renderItem={renderListItem}
            />
            {   
                showUserPreview && selectedUser &&  selectedUser.userId !== userData.userId && (
                    <UserPreview
                        userData={{
                                userId: selectedUser.userId,
                                profilePicture: selectedUser.profilePicture,
                                name: `${selectedUser.firstName} ${selectedUser.lastName}`,
                            }}
                        chatData={chatData}
                        onPressInfo={() => {
                            props.navigation.navigate("Contact", {  uid: selectedUser.userId, chatId: chatId });
                            handleGroupItemClose();
                        }}
                        onPressMakeAdmin={() => isAdminUser ? removeAdmin(selectedUser, chatData).then(handleGroupItemClose()) :
                            addAdmin(selectedUser, chatData).then(handleGroupItemClose())}
                        onPressRemove={() => removeUserFromChat(userData, selectedUser, chatData).then(handleGroupItemClose())}
                        onClose={() => handleGroupItemClose()}
                    />
                )
            }
        </PageContainer>
    );
};

export default DataListScreen;
