import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { Assistance } from '../screens/assistance';
import { Record } from '../screens/record';

const Stack = createStackNavigator();

export function AssistanceNavigator() {
    return (
        <Stack.Navigator screenOptions={{}}>
            <Stack.Screen options = {{headerShown: false}} name="Assistance" component={Assistance} />
            <Stack.Screen   options = {{headerShown: false }} name="Record" component={Record} />
        </Stack.Navigator>
    );
}
