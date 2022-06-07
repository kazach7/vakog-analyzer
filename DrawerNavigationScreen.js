import { StyleSheet, Text, View } from "react-native";
import React from "react";
// import { createDrawerNavigator } from "@react-navigation/drawer";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import HomeScreen from "./HomeScreen";
import DrawerContent from "./DrawerContent";
import MappingsView from "./MappingsView";

// const Drawer = createDrawerNavigator();
const Tab = createMaterialTopTabNavigator();

const DrawerNavigationScreen = () => {
  return (
    <Tab.Navigator tabBarOptions={{ tabStyle: { height: 0, padding: 0 } }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        screenOptions={{ headerShown: "false" }}
        options={{ swipeEnabled: false }}
      />
      {/* <Tab.Screen name="MappingsTab" component={MappingsView} /> */}
    </Tab.Navigator>
    // <Drawer.Navigator drawerContent={() => <DrawerContent />}>
    //   <Drawer.Screen
    //     name="Homeee"
    //     component={HomeScreen}
    //     options={{ headerShown: false }}
    //   />
    // </Drawer.Navigator>
  );
};

export default DrawerNavigationScreen;

const styles = StyleSheet.create({});
