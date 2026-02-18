import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import DisguiseScreen from './src/screens/DisguiseScreen';
import TransitionScreen from './src/screens/TransitionScreen';
import AuthScreen from './src/screens/AuthScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatScreen from './src/screens/ChatScreen';
import GroupChatScreen from './src/screens/GroupChatScreen';
import PrivacySettingsScreen from './src/screens/PrivacySettingsScreen';
import { AppProvider } from './src/utils/AppContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#000000" />
        <Stack.Navigator 
          initialRouteName="Disguise"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Disguise" component={DisguiseScreen} />
          <Stack.Screen name="Transition" component={TransitionScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="GroupChat" component={GroupChatScreen} />
          <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}