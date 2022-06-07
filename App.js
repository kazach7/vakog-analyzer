import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider } from "react-native-paper";
import LoginScreen from "./LoginScreen";
import HomeScreen from "./HomeScreen";
import CustomNavigationBar from "./CustomNavigationBar";
import MappingsView from "./MappingsView";
import SuggestionsView from "./SuggestionsView";
import DrawerNavigationScreen from "./DrawerNavigationScreen";
import { Provider } from "react-redux";
import { store } from "./store";
import SettingsScreen from "./SettingsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              header: (props) => <CustomNavigationBar {...props} />,
              gestureEnabled: true,
            }}
          >
            <Stack.Screen
              // options={{ headerShown: false }}
              name="Login"
              component={LoginScreen}
            />
            <Stack.Screen
              /* NOTE: The app crashes after it's opened, the user is automatically logged in and the app navigates to HomeScreen. Apparently navigation has 
            a conflict with WebView which is in QuillEditor. Setting animation to 'none' fixed the problem. See https://github.com/react-navigation/react-navigation/issues/9061  */
              options={{ animation: "none" }}
              name="Home"
              component={HomeScreen}
            />
            <Stack.Screen name="Mappings" component={MappingsView} />
            <Stack.Screen name="Suggestions" component={SuggestionsView} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
