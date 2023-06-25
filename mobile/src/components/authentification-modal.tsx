import React from "react";
import { View, TouchableWithoutFeedback, Keyboard, Image, Text } from "react-native";
import { px } from "../hooks/utils";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export function AuthenticationModal(props: { children: JSX.Element, text: string }) {
    return <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} >
        <View style={{ flex: 1, backgroundColor: "#f6f6f6" }}>
            <View style={{ backgroundColor: "#FF7276" }}>
                <View style={{ backgroundColor: '#FF7276', height: px(250) }}>
                    <Image style={{ marginTop: px(8), alignSelf: 'center', height: 200, borderRadius: px(120) }} source={require('../../assets/em2.jpg')} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', backgroundColor: '#f6f6f6', height: px(70), borderTopLeftRadius: px(100), borderTopRightRadius: px(100), alignItems: 'center' }}>
                    <Text style={{ fontSize: px(18), fontWeight: 'bold', color: 'black' }}>{props.text}</Text>
                </View>
            </View>
            <KeyboardAwareScrollView alwaysBounceVertical={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                {props.children}
            </KeyboardAwareScrollView>
        </View>
    </TouchableWithoutFeedback>
}
