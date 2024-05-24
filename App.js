import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from "react";
import { LogBox, StyleSheet } from "react-native";
import 'react-native-gesture-handler';
import { MenuProvider } from "react-native-popup-menu";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from 'react-redux';
import AppNavigator from './navigation/AppNavigator';
import { store } from './store/store';

//AsyncStorage.clear(); // force logging out
SplashScreen.preventAutoHideAsync();
LogBox.ignoreLogs(['Selector unknown returned a different result when called with the same parameters']);
//console.warn = () => {}; // Silences all warnings

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (args.some(arg => typeof arg === 'string' && arg.startsWith('Selector unknown returned a different result when called with the same parameters'))) {
    return;
  }
  originalConsoleWarn.apply(console, args); // If the warning does not match the specific sentence, pass it through
};


export default function App() {

  const [appIsLoaded, setAppIsLoaded] = useState(false);

  useEffect(() => {
    
    const prepare = async () => {
      try {
        await Font.loadAsync({
          "black": require("./assets/fonts//Roboto-Black.ttf"),
          "blackItalic": require("./assets/fonts/Roboto-BlackItalic.ttf"),
          "bold": require("./assets/fonts/Roboto-Bold.ttf"),
          "boldItalic": require("./assets/fonts/Roboto-BoldItalic.ttf"),
          "italic": require("./assets/fonts/Roboto-Italic.ttf"),
          "light": require("./assets/fonts/Roboto-Light.ttf"),
          "lightItalic": require("./assets/fonts/Roboto-LightItalic.ttf"),
          "medium": require("./assets/fonts/Roboto-Medium.ttf"),
          "mediumItalic": require("./assets/fonts/Roboto-MediumItalic.ttf"),
          "regular": require("./assets/fonts/Roboto-Regular.ttf"),
          "thin": require("./assets/fonts/Roboto-Thin.ttf"),
          "thinItalic": require("./assets/fonts/Roboto-ThinItalic.ttf"),
        });
      }
      catch (error) {
        console.log(error);
      }
      finally {
        setAppIsLoaded(true);
      }
    };

    prepare();
  }, []);

  const onLayout = useCallback(async () => {
    if (appIsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appIsLoaded]);

  if (!appIsLoaded) {
    return null;
  }

  return (
    <MenuProvider>
    <Provider store={store}>
    <SafeAreaProvider
      style={styles.container}
      onLayout={onLayout}>

        <AppNavigator />

    </SafeAreaProvider>
    </Provider>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  label: {
    color: 'black',
    fontSize: 18,
    fontFamily: "regular"
  }
});
