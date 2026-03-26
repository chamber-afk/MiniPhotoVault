import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'This method is deprecated',
]);


export default function App() {
  return <AppNavigator />;
}