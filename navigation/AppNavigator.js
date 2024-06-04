import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import React from "react";
import { useSelector } from "react-redux";
import AuthScreen from "../screens/AuthScreen";
import StartUpScreen from "../screens/StartUpScreen";
import MainNavigator from "./MainNavigator";

const AppNavigator = (props) => {

  const isAuth = useSelector(state => state.auth.token !== null && state.auth.token !== "");
  const didTryAutoLogin =  useSelector(state => state.auth.didTryAutoLogin);

  const linking = {
    prefixes: [Linking.createURL('/')],
    config: {
      screens: {
        Home: {
          screens: {
            Timeline: 'timeline',
            ChatList: {
              screens: {
                ChatScreen: 'chatscreen',
              }
            },
            Courses: 'courses',
            Settings: 'settings',
            
            
          },
        },
        NewChat: "newchat",
        JoinChat: 'joinchat/:invitationCode',
      },
    }
  };

  return (
    <NavigationContainer linking={linking}>
      {isAuth && <MainNavigator />}
      {!isAuth && didTryAutoLogin && <AuthScreen />}
      {!isAuth && !didTryAutoLogin && <StartUpScreen />}
      
    </NavigationContainer>
  );
};

export default AppNavigator;