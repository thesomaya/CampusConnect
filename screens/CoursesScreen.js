import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import CourseItem from '../components/CourseItem';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import colors from '../constants/colors';
import { getPostCreatorName } from "../utils/actions/postActions";

const CoursesScreen = props => {

    const selectedUser = props.route?.params?.selectedUserId;
    const selectedUserList = props.route?.params?.selectedUsers;
    const [creatorNames, setCreatorNames] = useState({});
    const userData = useSelector(state => state.auth.userData);
    const storedUsers = useSelector(state => state.users.storedUsers);
    const userChats = useSelector(state => {
        const chatsData = state.chats.chatsData;
        return Object.values(chatsData).sort((a, b) => {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
    });


    
    const chatName = props.route?.params?.chatName;

    const filteredUserChats = userChats.filter(chat => chat.isCourseChat);

    useEffect(() => {

        if (!selectedUser && !selectedUserList) {
            return;
        }

        let chatData;
        let navigationProps;

        if (selectedUser) {
            chatData = userChats.find(cd => !cd.isGroupChat && cd.users.includes(selectedUser))
        }

        if (chatData) {
            navigationProps = { chatId: chatData.key }
        }
        else {
            const chatUsers = selectedUserList || [selectedUser];
            if (!chatUsers.includes(userData.userId)){
                chatUsers.push(userData.userId);
            }

            navigationProps = {
                newChatData: {
                    users: chatUsers,
                    isGroupChat: selectedUserList !== undefined,
                    isCourseChat: true,
                    ...(selectedUserList && { chatName }),
                }
            }
        }
        
        

        props.navigation.navigate("ChatScreen", navigationProps);

    }, [props.route?.params])
    
    useEffect(() => {
        const fetchCreatorNames = async () => {
            const names = {};
            for (const chat of filteredUserChats) {

                const createdBy = chat.createdBy;
                const creatorName = await getPostCreatorName(createdBy);
                if (creatorName) {
                    names[createdBy] = creatorName;
                }
                }
                setCreatorNames(names);
            }
        

        fetchCreatorNames();
    }, [storedUsers]);

    return <PageContainer>

        <PageTitle text="Courses" />
            {   
                userData.selectedRole == "facultyMember" &&
                <View>
                    <TouchableOpacity onPress={() => props.navigation.navigate("NewChat", { isGroupChat: true , isCourseChat: true })}>
                        <Text style={styles.newGroupText}>New Course</Text>
                    </TouchableOpacity>
                </View>
            }

            <FlatList
                data={filteredUserChats}
                renderItem={(itemData) => {
                  const chatData = itemData.item;
                  const chatId = chatData.key;
                  const isGroupChat = chatData.isGroupChat;

                    let title = "";
                    const subTitle = chatData.latestMessageText || "New chat";
                    let image = "";

                    if (isGroupChat) {
                        title = chatData.chatName;  
                        image = chatData.chatImage;
                    }
                    else {
                        const otherUserId = chatData.users.find(uid => uid !== userData.userId);
                        const otherUser = storedUsers[otherUserId];

                        if (!otherUser) return;

                        title = `${otherUser.firstName} ${otherUser.lastName}`;
                        image = otherUser.profilePicture;
                    }
                    const createdBy = chatData.createdBy;
                    const creatorName = creatorNames[createdBy] || "";

                    return <CourseItem
                                title={title}
                                chatId={chatId}
                                subTitle={subTitle}
                                image={image}
                                creatorName={creatorName}
                                onPress={() => props.navigation.navigate("ChatScreen", { chatId })}
                            />
                }}
            />
        </PageContainer>
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    newGroupText: {
        color: colors.blue,
        fontSize: 17,
        marginBottom: 10
    }
})

export default CoursesScreen;