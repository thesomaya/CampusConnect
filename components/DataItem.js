import { AntDesign, Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { MenuOption } from 'react-native-popup-menu';
import uuid from 'react-native-uuid';
import colors from '../constants/colors';
import ProfileImage from './ProfileImage';


const imageSize = 40;

const MenuItem = props => {

    const Icon = props.iconPack ?? Feather;


    return <MenuOption onSelect={props.onSelect}>
        <View style={styles.menuItemContainer}>
            <Text style={styles.menuText}>{props.text}</Text>
            <Icon name={props.icon} size={18} />
        </View>
    </MenuOption>
}

const DataItem = props => {
    const { title, subTitle, image, type, isChecked, icon, chatId, itemStyle , isGroup} = props;
    const hideImage = props.hideImage && props.hideImage === true;
    const titleColor = itemStyle === "disabled" ? colors.lightGrey : colors.textColor;
    const menuRef = useRef(null);
    const id = useRef(uuid.v4());

    return (
        <TouchableWithoutFeedback
        onPress={props.onPress}
        //onLongPress={() => (props.type !== "checkbox" && menuRef.current.props.ctx.menuActions.openMenu(id.current))}
        style={{ width: '100%' }}
        >
            <View style={styles.container}>

                {
                    !icon && !hideImage &&
                    <ProfileImage
                        uri={image}
                        size={imageSize}
                        isGroup={isGroup}
                    />
                }

                {
                    icon &&
                    <View style={styles.leftIconContainer}>
                        <AntDesign name={icon} size={20} color={colors.blue} />
                    </View>
                }


                <View style={styles.textContainer}>

                    <Text
                        numberOfLines={1}
                        style={{ ...styles.title, ...{ color: type === "button" ? colors.blue : titleColor },  }}>
                        {title}
                    </Text>

                    {
                        subTitle &&
                        <Text
                            numberOfLines={1}
                            style={styles.subTitle}>
                            {subTitle}
                        </Text>
                    }

                </View>


                {
                    type === "checkbox" &&
                    <View style={{ ...styles.iconContainer, ...isChecked && styles.checkedStyle }}>
                        <Ionicons name="checkmark" size={18} color="white" />
                    </View>
                }

                {
                    type === "link" &&
                    <View>
                        <Ionicons name="chevron-forward-outline" size={18} color={colors.grey} />
                    </View>
                }
                
                {
                //type !== "checkbox" &&
                // <Menu name={id.current} ref={menuRef}>
                //     <MenuTrigger />
                //     <MenuOptions>
                //         <MenuItem text='Delete' icon={'delete'} iconPack={AntDesign} onSelect={() => deleteChat(chatId)} />
                //     </MenuOptions>
                // </Menu> 
                }
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 7,
        borderBottomColor: colors.extraLightGrey,
        borderBottomWidth: 1,
        alignItems: 'center',
        minHeight: 50
    },
    textContainer: {
        marginLeft: 14,
        flex: 1
    },
    title: {
        fontFamily: 'medium',
        fontSize: 16,
        letterSpacing: 0.3
    },
    subTitle: {
        fontFamily: 'regular',
        color: colors.grey,
        letterSpacing: 0.3
    },
    iconContainer: {
        borderWidth: 1,
        borderRadius: 50,
        borderColor: colors.lightGrey,
        backgroundColor: 'white'
    },
    checkedStyle: {
        backgroundColor: colors.primary,
        borderColor: 'transparent'
    },
    leftIconContainer: {
        backgroundColor: colors.extraLightGrey,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        width: imageSize,
        height: imageSize
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
});

export default DataItem;