import { useNavigation } from "@react-navigation/native";
import { Button, FormControl, Input, VStack } from "native-base";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { px } from "../../hooks/utils";
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import { AuthenticationModal } from "../../components/authentification-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseUrl } from "../../services/config";
import * as WebBrowser from 'expo-web-browser';
import * as Google from "expo-auth-session/providers/google";
import { ResponseType } from "expo-auth-session";
import * as AuthSession from 'expo-auth-session';
import { GOOGLE_LOGIN_IOS_ID } from "@env";

WebBrowser.maybeCompleteAuthSession();

type FormData<T> = {
    phone: T,
    password: T
}

export const initialConceptData = {
    id: "",
    firstName: "",
    token: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    birthDate: "",
    bloodType: "",
    progress: 0,
    gender: "",
    image: "",
    allergies: {
        food: "",
        medication: "",
        other: ""
    },
    contacts: [],
    restrictedContacts: []
}

const useProxy = true;
const redirectUri = AuthSession.makeRedirectUri({
    useProxy,
});
export function LoginScreen() {
    const [accessToken, setAccessToken] = useState("");
    const [user, setUser] = useState(null);
    AuthSession.useAutoDiscovery('https://auth.expo.io');
    const [request, response, promptAsync] = Google.useAuthRequest(
        {
            responseType: ResponseType.Code,
            iosClientId: GOOGLE_LOGIN_IOS_ID,
            redirectUri: "host.exp.exponent:/oauthredirect"
        }
    )

    useEffect(() => {
        if (response?.type === "success") {
            setAccessToken(response?.authentication?.accessToken!);
            accessToken && fetchUserInfo();
        }
    }, [response, promptAsync, accessToken])

    async function fetchUserInfo() {
        let response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const useInfo = await response.json();
        fetch(`${baseUrl}/user/loginwithgoogle`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: useInfo.email,
                firstname: useInfo.given_name,
                lastname: useInfo.family_name,
                id: useInfo.id
            })
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
        }).then(res => {
            concept.setValue(res);
            AsyncStorage.setItem("userPayload", JSON.stringify(res));
        })
        setUser(useInfo);
    }

    const navigation = useNavigation();
    const [formData, setData] = useState<FormData<string>>({
        phone: "",
        password: ""
    });
    const [errors, setErrors] = useState<FormData<string>>({
        phone: "",
        password: ""
    });
    const validate = () => {
        let errorsFound = 0;
        let validationErrors = {
            phone: "",
            password: "",
        };
        if (formData.phone === "") {
            validationErrors = { ...validationErrors, phone: "Phone is required" }
            errorsFound++;
        }
        if (formData.password === "") {
            validationErrors = {
                ...validationErrors,
                password: "Password is required"
            }
            errorsFound++;
        }
        setErrors(validationErrors);
        if (errorsFound > 0) return false;
        return true;
    };
    const concept = React.useContext(LoginContext);
    const onSubmit = () => {
        if (validate()) {
            fetch(`${baseUrl}/user/login`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phonenumber: formData.phone,
                    password: formData.password
                })
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
            }).then(res => {
                if (res) {
                    concept.setValue(res);
                    AsyncStorage.setItem("userPayload", JSON.stringify(res));
                    setData({
                        phone: "",
                        password: ""
                    });
                } else {
                    Alert.alert("Internal server error!");
                }
            })
                .catch(e => {
                    Alert.alert("Internal server error!");
                })
        } else {
            console.log('Validation Failed');
        }
    }

    return <AuthenticationModal text={"Login to your account"}>
        <View style={{ borderTopEndRadius: px(70), borderTopStartRadius: px(70), backgroundColor: 'white', flexGrow: 1 }}>
            <View style={{ marginBottom: px(48), alignItems: 'center' }}>
                <View style={{ marginTop: px(20), flexDirection: 'row', justifyContent: 'space-around' }}>
                    <TouchableOpacity style={{ backgroundColor: "white", width: 35, height: 35, justifyContent: 'center', alignItems: 'center', borderRadius: px(100) }}>
                        <MaterialCommunityIcons name="facebook" size={px(28)} color="#4267B2"></MaterialCommunityIcons>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ backgroundColor: "white", width: 35, height: 35, justifyContent: 'center', alignItems: 'center', borderRadius: px(100) }}>
                        <MaterialCommunityIcons name="apple" size={px(28)} color="black"></MaterialCommunityIcons>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={!request}
                        onPress={() => {
                            promptAsync();
                        }} style={{ backgroundColor: "white", width: 35, height: 35, justifyContent: 'center', alignItems: 'center', borderRadius: px(100) }}>
                        <AntDesign name="googleplus" size={px(28)} color="#d82c2c"></AntDesign>
                    </TouchableOpacity>
                </View>
                <Text style={{ color: '#808080' }}>or use your email account</Text>
            </View>
            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                <VStack width="90%" mx="5" maxW="225px">
                    <FormControl isInvalid={errors.phone !== "" || errors.password !== ""}>
                        <Input
                            leftElement={<MaterialCommunityIcons style={{ marginLeft: px(10) }}
                                name="account"
                                size={px(24)}
                                color="#808080" />}
                            height={px(40)}
                            value={formData.phone}
                            keyboardType="numeric"
                            borderRadius={px(24)}
                            _focus={{ style: { backgroundColor: "#F8F8F8" } }}
                            placeholder="Phone number"
                            onChangeText={value => setData({
                                ...formData,
                                phone: value
                            })} />
                        {errors.phone.length ? <FormControl.ErrorMessage>{errors.phone}</FormControl.ErrorMessage> : <></>}
                        {''}
                        <Input
                            leftElement={<MaterialCommunityIcons style={{ marginLeft: px(10) }}
                                name="key-variant"
                                size={px(24)}
                                color="#808080" />}
                            height={px(40)}
                            value={formData.password}
                            borderRadius={px(24)}
                            _focus={{ style: { backgroundColor: "#F8F8F8" } }}
                            placeholder="Password"
                            secureTextEntry={true}
                            onChangeText={value => {
                                setData({
                                    ...formData,
                                    password: value
                                });
                            }} />
                        {errors.password.length ? <FormControl.ErrorMessage>{errors.password}</FormControl.ErrorMessage> : <></>}
                    </FormControl>
                    <Button onPress={onSubmit} style={{ marginTop: px(40), borderRadius: px(10), backgroundColor: '#FF7276', height: px(50), width: px(250), alignSelf: 'center' }}>
                        <Text style={{ fontSize: px(16), fontWeight: 'bold', color: 'white' }}>Log in</Text>
                    </Button>
                    <TouchableOpacity style={{ marginTop: px(20) }} onPress={() => { navigation.navigate("Emergency" as never) }}>
                        <Text style={{ textShadowColor: '#F0F0F0', textShadowOffset: { width: 0, height: 16 }, textShadowRadius: 4, shadowOpacity: 0.3, fontSize: px(12), color: 'grey' }}>Forgot password?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginTop: px(20) }} onPress={() => { navigation.navigate("SignUp" as never) }}>
                        <Text style={{ textShadowColor: '#F0F0F0', textShadowOffset: { width: 0, height: 16 }, textShadowRadius: 4, shadowOpacity: 0.3, fontSize: px(12), color: 'grey' }}>Don't you have an account? Sign in!</Text>
                    </TouchableOpacity>
                </VStack>
            </View>
        </View>
    </AuthenticationModal>
}

export type Contact = {
    firstname: string,
    lastname: string,
    phone: string,
    photo: string,
    id: number
}

export type Concept = {
    id: string,
    token: string,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    password: string,
    birthDate: string,
    bloodType: string,
    progress: number,
    gender: string,
    image: string,
    allergies: {
        food: string,
        medication: string,
        other: string
    },
    contacts: Contact[],
    restrictedContacts: Contact[]
}

export const LoginContext = React.createContext<{ value: Concept, setValue: (value: Concept) => void }>({
    value: initialConceptData, setValue: () => { }
})
