import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ProfileScreen } from '../screens/profile';
import { EmergencyNavigator } from './emergency-navigator';
import { AssistanceNavigator } from './assistance-navigator';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { ReportNavigator } from './report-navigator';

const Tab = createBottomTabNavigator();

export function BottomNavBar() {

    return (
        <Tab.Navigator initialRouteName="Emergency"
            screenOptions={{
                tabBarActiveBackgroundColor: "white",
                tabBarInactiveBackgroundColor: "white",
                tabBarActiveTintColor: "darkblue",
                headerTitle: "",
                headerShown: false
            }}
        >
            <Tab.Screen name="Emergency" component={EmergencyNavigator} options={{
                tabBarIcon: ({ color, focused }) => (
                    <MaterialIcons name="add-alert" size={24} color={focused ? "darkblue" : "grey"} />
                ),
            }} />
            <Tab.Screen name="Assistance" component={AssistanceNavigator} options={{
                tabBarIcon: ({ color, focused }) => (
                    <FontAwesome name="assistive-listening-systems" size={24} color={focused ? "darkblue" : "grey"} />
                ),
            }} />
            <Tab.Screen name="Report" component={ReportNavigator} options={{
                tabBarIcon: ({ color, focused }) => (
                    <MaterialIcons name="report" size={24} color={focused ? "darkblue" : "grey"} />
                ),
            }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{
                tabBarIcon: ({ color, focused }) => (
                    <MaterialCommunityIcons name="account" size={24} color={focused ? "darkblue" : "grey"} />
                ),
            }} />
        </Tab.Navigator>
    );
}
