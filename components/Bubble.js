import React, { useRef } from 'react';
import { Image, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import colors from '../constants/colors';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import uuid from 'react-native-uuid';
import * as Clipboard from 'expo-clipboard';
import { Feather, FontAwesome, AntDesign, Ionicons } from '@expo/vector-icons';
import { starMessage, deleteMessage } from '../utils/actions/chatActions';
import { useSelector } from 'react-redux';

function formatTime(dateString) {
    const date = new Date(dateString);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;  
  }

const MenuItem = props => {

    const Icon = props.iconPack ?? Feather; // default to Feather if no iconPack was passed

    return <MenuOption onSelect={props.onSelect}>
        <View style={styles.menuItemContainer}>
            <Text style={styles.menuText}>{props.text}</Text>
            <Icon name={props.icon} size={18} />
        </View>
    </MenuOption>
}

const Bubble = props => {
    const { text, type, messageId, chatId, userId , date, setReply, replyingTo, name, imageUrl} = props;
    const starredMessages = useSelector(state => state.messages.starredMessages[chatId] ?? {} );
    const storedUsers =  useSelector(state => state.users.storedUsers);
    const bubbleStyle = { ...styles.container };
    const textStyle = { ...styles.text };
    const wrapperStyle = { ...styles.wrapperStyle }

    const menuRef = useRef(null);
    const id = useRef(uuid.v4());

    let Container = View;
    let isUserMessage = false;
    const dateString = date && formatTime(date);

    switch (type) {
        case "system":
            textStyle.color = '#65644A';
            bubbleStyle.backgroundColor = colors.beige;
            bubbleStyle.alignItems = 'center';
            bubbleStyle.marginTop = 10;
            break;
        case "error":
            bubbleStyle.backgroundColor = colors.red;
            textStyle.color = 'white';
            bubbleStyle.marginTop = 10;
            break;
        case "myMessage":
            wrapperStyle.justifyContent = 'flex-end';
            bubbleStyle.backgroundColor = '#E7FED6';
            bubbleStyle.maxWidth = '90%';
            Container = TouchableWithoutFeedback;
            isUserMessage = true;
            break;
        case "theirMessage":
            wrapperStyle.justifyContent = 'flex-start';
            bubbleStyle.maxWidth = '90%';
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

    const copyToClipboard = async text => {
        try {
            await Clipboard.setStringAsync(text);
        } catch (error) {
            console.log(error);
            console.log(error.message);
            console.log(error.stack);
        }
    }
    const isStarred = isUserMessage && starredMessages[messageId] !== undefined;
    const replyingToUser = replyingTo && storedUsers[replyingTo.sentBy];
    return (
        <View style={wrapperStyle}>
            <Container onLongPress={() => menuRef.current.props.ctx.menuActions.openMenu(id.current)} style={{ width: '100%' }}>
                <View style={bubbleStyle}>

                    {
                        name && type !== "info" &&
                        <Text style={styles.name} > {name} </Text>
                    }

                    {
                        replyingToUser && 
                        <Bubble 
                            type="reply"
                            text={replyingTo.text}
                            name={`${replyingToUser.firstLast}`}
                        />
                    }
                    {
                        !imageUrl &&
                        <Text style={textStyle}>
                            {text}
                        </Text>
                    }

                    {
                        imageUrl && 
                        <Image source={{ uri: imageUrl }} style={styles.image} />
                    }
                
                {
                    dateString && type !== "info" && <View style={styles.timeContainer}>
                        { isStarred && <FontAwesome name="star" size={11} color= {colors.grey} style={ { marginRight: 2, marginTop: 2} }/> }
                        <Text style={styles.time} > {dateString} </Text>
                    </View>
                }

                <Menu name={id.current} ref={menuRef}>
                    <MenuTrigger />

                    <MenuOptions>
                        <MenuItem text='Copy to clipboard' icon={'copy'} onSelect={() => copyToClipboard(text)} />
                        <MenuItem text={ `${isStarred ? "Unstar" : "Star" } message` } icon={ isStarred ? 'star' : 'star-o'} iconPack={FontAwesome} onSelect={() => starMessage(messageId,chatId,userId)} />
                        <MenuItem text= "Reply" icon="arrow-undo-outline" iconPack={Ionicons} onSelect={setReply} />
                        { type==="myMessage" && (
                            <MenuItem text= "Delete" icon="delete" iconPack={AntDesign} onSelect={() =>  deleteMessage(chatId, messageId)} />
                        )}
                    </MenuOptions>
                </Menu>


                </View>
            </Container>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapperStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 6,
        padding: 5,
        marginBottom: 10,
        borderColor: '#E2DACC',
        borderWidth: 1,
    },
    text: {
        fontFamily: 'regular',
        letterSpacing: 0.3
    },
    menuItemContainer: {
        flexDirection: 'row',
        padding: 5,
        
    },
    menuText: {
        flex: 1,
        fontFamily: 'regular',
        letterSpacing: 0.3,
        fontSize: 16
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
        width: 300,
        height: 300,
        marginBottom: 5,
    }
})

export default Bubble;