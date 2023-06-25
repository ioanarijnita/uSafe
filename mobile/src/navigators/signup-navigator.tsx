import React, { useContext } from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { SignUpScreen } from '../screens/common/signup';
import { LoginContext, LoginScreen } from '../screens/common/login';
import { BottomNavBar } from './bottom-tab-navigator';

const Stack = createStackNavigator();

export function SignUpNavigator() {
    const concept = useContext(LoginContext)
    return (
        concept.value.id !== "" ?
        <Stack.Navigator screenOptions={{}}>
            <Stack.Screen options = {{headerStyle: { backgroundColor: "#f3f9fe" }, headerShown: false}} name = "Emergency" component = {BottomNavBar} />
        </Stack.Navigator> : 
        <Stack.Navigator screenOptions={{}}>
        <Stack.Screen options = {{headerShown: false}} name="SignUp" component={SignUpScreen} />
       <Stack.Screen   options = {{headerShown: false }} name="Login" component={LoginScreen} />
   </Stack.Navigator>
    );
}
