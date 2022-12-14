import React from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider } from 'styled-components';
import 'react-native-gesture-handler';

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold
} from '@expo-google-fonts/poppins'

import AppLoading from 'expo-app-loading'

import theme from './src/global/styles/theme';

import { AppRoutes } from './src/routes/app.routes';

import { SignIn } from './src/screens/SignIn';
import { Routes } from './src/routes';
import { AuthProvider, useAuth } from './src/hooks/auth';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
  });

  const { userStorageLoading } = useAuth();

  if(!fontsLoaded || userStorageLoading){
    return <AppLoading />
  }

  return (
    <ThemeProvider theme={theme}>
        <StatusBar barStyle="light-content"/>
        <AuthProvider>
          <Routes/>
        </AuthProvider>
    </ThemeProvider>

  )
};
