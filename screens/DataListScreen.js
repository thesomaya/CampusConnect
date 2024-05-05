import React, { useEffect, useState} from 'react';
import { FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import GroupItem from '../components/GroupItem';
import DataItem from '../components/DataItem';
import PageContainer from '../components/PageContainer';
import UserPreview from "../components/UserPreview";
import { addUsersToChat, removeUserFromChat, updateChatData} from "../utils/actions/chatActions";
import {
    addAdmin,
    isAdmin,
  } from "../utils/actions/chatActions";

const DataListScreen = props => {

    const [showUserPreview, setShowUserPreview] = useState(false);
    const [selectedUser, setSelectedUser] = useState();

    const storedUsers = useSelector(state => state.users.storedUsers);
    const userData = useSelector(state => state.auth.userData);
    const messagesData = useSelector(state => state.messages.messagesData);
    
    const { title, data, type, chatId, chatData} = props.route.params;
    console.log("data: ", chatData);

    useEffect(() => {
      }, [selectedUser]);

    const handleGroupItemPress = (user) => {
        setSelectedUser(user);
        console.log("*",selectedUser);
        setShowUserPreview(true);
      };

    const handleGroupItemClose= () => {
        setSelectedUser(null);
        setShowUserPreview(false);
    };
    
      useEffect(() => {
        props.navigation.setOptions({ headerTitle: title })
    }, [title])

    return <PageContainer>
            <FlatList
                data={data}
                keyExtractor={item => item.messageId || item}
                renderItem={(itemData) => {
                    let key, onPress, image, title, subTitle, itemType;

                    if (type === "users") {
                        const uid = itemData.item;
                        const currentUser = storedUsers[uid];

                        if (!currentUser) return;

                        const isLoggedInUser = uid === userData.userId;

                        key = uid;
                        image = currentUser.profilePicture;
                        title = `${currentUser.firstName} ${currentUser.lastName}`;
                        subTitle = currentUser.about;
                        itemType = isLoggedInUser ? undefined : "link";
                        onPress = isLoggedInUser ? undefined : () => handleGroupItemPress(currentUser)
                    }
                    else if (type === "messages") {
                        const starData = itemData.item;
                        const { chatId, messageId } = starData;
                        const messagesForChat = messagesData[chatId];

                        if (!messagesForChat) {
                            return;
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

                    return type==="users" ? (<GroupItem
                        key={key}
                        onPress={onPress}
                        image={image}
                        title={title}
                        subTitle={subTitle}
                        type={itemType}
                    />) : (<DataItem
                    key={key}
                    onPress={onPress}
                    image={image}
                    title={title}
                    subTitle={subTitle}
                    type={itemType}
                />)

                }}
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
                    onPressInfo={() =>
                        props.navigation.navigate("Contact", {  uid: selectedUser.userId, chatId: chatId })
                    }
                    onPressMakeAdmin={() => addAdmin(selectedUser, chatData)}
                    onPressRemove={() => removeUserFromChat(userData, selectedUser, chatData)}
                    onClose={() => handleGroupItemClose()}
                />)
            }

    </PageContainer>
};

export default DataListScreen;