import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { EmergencyScreen } from '../screens/emergency';
import { MapScreen } from '../screens/map';

const Stack = createStackNavigator();

export function EmergencyNavigator() {
    return (
        <Stack.Navigator screenOptions={{}}>
            <Stack.Screen options = {{headerShown: false}} name="Emergency" component={EmergencyScreen} />
            <Stack.Screen   options = {{headerShown: false }} name="Map" component={MapScreen} />
        </Stack.Navigator>
    );
}
