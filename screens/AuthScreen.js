import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import logo from "../assets/images/campus_connect_logo.png";
import PageContainer from '../components/PageContainer';
import SignInForm from '../components/SignInForm';
import SignUpForm from '../components/SignUpForm';
import colors from '../constants/colors';

const AuthScreen = props => {


    const [isSignUp, setIsSignUp] = useState(false);
    
    return <SafeAreaView style={{ flex: 1}}>
        <PageContainer>

                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === "ios" ? "height" : undefined}
                    keyboardVerticalOffset={100}>

                    <View style={styles.imageContainer}>
                        <Image
                            style={styles.image}
                            source={logo}
                            resizeMode='contain' />
                    </View>
                    <View style={styles.formContainer}>
                        {
                            isSignUp ?
                            <SignUpForm /> :
                            <SignInForm />
                        }
                    </View>
                    <TouchableOpacity
                        onPress={() => setIsSignUp(prevState => !prevState)}
                        style={styles.linkContainer}>
                        <Text style={styles.link}>{ `Switch to ${isSignUp ? "sign in" : "sign up"}` }</Text>
                    </TouchableOpacity>

                </KeyboardAvoidingView>

        </PageContainer>
    </SafeAreaView>
};

const styles = StyleSheet.create({
    linkContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 15
    },
    link: {
        color: colors.blue,
        fontFamily: 'medium',
        letterSpacing: 0.3
    },
    imageContainer: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginVertical: 20,
    },
    image: {
        width: 400,
        height: 100,
    },
    keyboardAvoidingView: {
        flex: 1,
        justifyContent: 'center',
    },
    formContainer: {
        justifyContent: 'center',
    },
})

export default AuthScreen;