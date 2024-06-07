import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import DataItem from '../components/DataItem';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import ProfileImage from '../components/ProfileImage';
import SubmitButton from '../components/SubmitButton';
import colors from '../constants/colors';
import { addBlock, removeBlock } from '../utils/actions/chatActions';
import { getUserChats } from '../utils/actions/userActions';

const ContactScreen = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const storedUsers = useSelector(state => state.users.storedUsers);
    const userData = useSelector(state => state.auth.userData);
    const currentUser = storedUsers[props.route.params.uid];
    const userBlocks = useSelector(state => state.users.blockedUsers);
    const storedChats = useSelector(state => state.chats.chatsData);
    const [commonChats, setCommonChats] = useState([]);

    const chatId = props.route.params.chatId;
    const chatData = chatId && storedChats[chatId];

    useEffect(() => {
        const getCommonUserChats = async () => {
            const currentUserChats = await getUserChats(currentUser.userId);
            setCommonChats(
                Object.keys(currentUserChats).filter(cid => storedChats[cid] && storedChats[cid].isGroupChat)
            );
        };

        getCommonUserChats();

        const block = userBlocks?.[userData.userId]?.[currentUser.userId] === true;
        setIsBlocked(block);

    }, [currentUser.userId, storedChats]);

    const toggleBlockUser = useCallback(async () => {
        try {
            setIsLoading(true);

            if (isBlocked) {
                await removeBlock(userData, currentUser);
            } else {
                await addBlock(userData, currentUser);
            }
            setIsBlocked(!isBlocked);
            //props.navigation.goBack();
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }, [isBlocked, userData, currentUser, props.navigation]);

    return (
        <PageContainer>
            <View style={styles.topContainer}>
                <ProfileImage
                    uri={currentUser.profilePicture}
                    size={80}
                    style={{ marginBottom: 20 }}
                />
                <PageTitle text={`${currentUser.firstName} ${currentUser.lastName}`} />
                {currentUser.about && (
                    <Text style={styles.about} numberOfLines={2}>{currentUser.about}</Text>
                )}
            </View>
            {commonChats.length > 0 && (
                <ScrollView>
                    <View style={styles.container}>
                        <Text style={styles.heading}>{commonChats.length} {commonChats.length === 1 ? "Group" : "Groups"} in Common</Text>
                        {commonChats.map(cid => {
                            const chatData = storedChats[cid];
                            return (
                                <DataItem
                                    key={cid}
                                    title={chatData.chatName}
                                    subTitle={chatData.latestMessageText}
                                    type="link"
                                    onPress={() => props.navigation.push("ChatScreen", { chatId: cid })}
                                    image={chatData.chatImage}
                                />
                            );
                        })}
                    </View>
                </ScrollView>
            )}
            {isLoading ? (
                <ActivityIndicator size='small' color={colors.primary} />
            ) : (
                <SubmitButton
                    title={isBlocked ? "Unblock User" : "Block User"}
                    style={{ width: "40%", alignSelf: "center", marginBottom: 20 }}
                    onPress={toggleBlockUser}
                />
            )}
        </PageContainer>
    );
};

const styles = StyleSheet.create({
    topContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
        justifyContent: 'flex-start'
    },
    about: {
        fontFamily: 'medium',
        fontSize: 16,
        letterSpacing: 0.3,
        color: colors.grey
    },
    container: {
        flex: 1,
        justifyContent: 'flex-start'
    },
    heading: {
        fontFamily: 'bold',
        letterSpacing: 0.3,
        color: colors.textColor,
        marginVertical: 8,
    }
});

export default ContactScreen;
