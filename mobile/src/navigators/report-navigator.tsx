import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { ReportCrime } from '../screens/report-crime';

const Stack = createStackNavigator();

export function ReportNavigator() {
    return (
        <Stack.Navigator screenOptions={{}}>
            <Stack.Screen options = {{headerShown: false}} name="Report" component={ReportCrime} />
        </Stack.Navigator>
    );
}
