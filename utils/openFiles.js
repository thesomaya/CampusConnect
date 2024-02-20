import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Linking } from 'react-native';

const openPDF = async documentURL => {
  try {

    await Linking.openURL(documentURL);
  } catch (error) {
    console.log('Error opening PDF:', error);
  }
};

// Replace these with actual functions to open Word and PowerPoint documents
const openWord = async documentURL => {
  // Implement your Word viewer logic here, possibly using a library like `react-native-doc-viewer`
  // Example: https://github.com/siegfriedgrimbeek/react-native-doc-viewer
};

const openPowerPoint = async documentURL => {
  // Implement your PowerPoint viewer logic here, possibly using a library like `react-native-doc-viewer`
  // Example: https://github.com/siegfriedgrimbeek/react-native-doc-viewer
};

export { openPDF, openWord, openPowerPoint };
