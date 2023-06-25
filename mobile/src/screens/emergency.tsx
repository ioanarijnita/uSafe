import React, { useContext, useRef, useState } from 'react'
import { View, Text, Animated, Alert, Image } from 'react-native';
import { LoginContext, initialConceptData } from './common/login';
import { useNavigation } from '@react-navigation/native';
import { px } from '../hooks/utils';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { LocationContext } from '../../App';
import { baseUrl } from '../services/config';
import Toast from "react-native-root-toast";
import AsyncStorage from '@react-native-async-storage/async-storage';

export function EmergencyScreen() {
    const concept = useContext(LoginContext);
    const nav = useNavigation();
    const [showOptions, setShowOptions] = useState(false);
    const [optionsSelectedState, setOptionsSelectedState] = useState<("accident" | "injury" | "following")[]>([]);
    const location = useContext(LocationContext);
    const [notificationId, setNotificationId] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const optionsSelected = useRef<("accident" | "injury" | "following")[]>([]);
    const buttonPressed = useRef(false);
    const animatedPadding = React.useRef(new Animated.Value(0)).current

    const onSOSPress = () => {
        if (!buttonPressed.current) {
            buttonPressed.current = true;
            setShowOptions(true);
            optionsSelected.current = [];
            setOptionsSelectedState([]);
            Toast.show("Your emergency request will arrive to us in a few seconds. Please press the button again if you want to revert.", {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM - 50,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 0,
                containerStyle: { borderRadius: 16, width: "90%" }
            });
            Animated.loop(
                Animated.sequence([
                    Animated.timing(
                        animatedPadding,
                        {
                            toValue: 20,
                            duration: 1000,
                            useNativeDriver: false
                        }
                    ),
                    Animated.timing(
                        animatedPadding,
                        {
                            toValue: 0,
                            duration: 1000,
                            useNativeDriver: false
                        }
                    )
                ]), { iterations: buttonPressed.current ? 6 : 0 }
            ).start(({ finished }) => {
                if (buttonPressed.current && finished) {
                    setIsSubmitted(true);
                    setShowOptions(false);
                    buttonPressed.current = false;
                    nav.navigate("Map" as never, {isAlert: true} as never);
                    const notifId = Math.floor(Math.random() * 100 + Math.random() * 34 + Math.random() * 24);
                    setNotificationId(notifId)
                    fetch(`${baseUrl}/notifications/sendnotification`, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'x-access-token': `${concept.value.token}`
                        },
                        body: JSON.stringify({
                            if: concept.value.id,
                            firstname: concept.value.firstName,
                            lastname: concept.value.lastName,
                            email: concept.value.email,
                            bloodtype: concept.value.bloodType,
                            birthdate: concept.value.birthDate,
                            phonenumber: concept.value.phoneNumber,
                            gender: concept.value.gender,
                            latitude: location.value.latitude,
                            longitude: location.value.longitude,
                            address: location.value.address,
                            image: concept.value.image,
                            allergies: concept.value.allergies,
                            contacts: concept.value.contacts,
                            restrictedcontacts: concept.value.restrictedContacts,
                            definedmessage: optionsSelected.current,
                            notificationtype: "SOS Alert",
                            notificationid: notifId
                        })
                    }).then((response) => {
                        if (response.status === 403) {
                            AsyncStorage.removeItem("userPayload");
                            concept.setValue(initialConceptData);
                            throw new Error("Error");
                        }
                        if (response.ok) {
                            return response.json();
                        }
                    }).then(res => {

                    })
                        .catch(e => {
                            console.log(e);
                            Alert.alert("Error")
                        });
                }
            })
        } else {
            buttonPressed.current = false;
            setShowOptions(false);
            Toast.show("Emergency request stopped.", {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM - 50,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 0,
            });
            Animated.timing(animatedPadding, { toValue: 0, duration: 800, useNativeDriver: false }).start(({ finished }) => {
                if (finished) {
                    animatedPadding.stopAnimation();
                }
            })
        }
    }

    if (!concept.value) return <></>;
    return (
        <View style={{ flex: 1, alignItems: "center", backgroundColor: "white" }}>
            <View style={{ flex: 0.135, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f2f2f2", width: "92%", marginTop: px(16), borderRadius: px(24), shadowColor: "black", shadowOffset: { height: 2, width: 2 }, shadowOpacity: 0.4 }}>
                <Text style={{ fontWeight: "bold", fontSize: px(16), marginLeft: 24 }}>Emergency</Text>
                {concept.value.image ?
                    <Image source={{ uri: baseUrl + "/profile/" + concept.value.image }} style={{ marginRight: px(20), width: px(60), height: px(60), borderRadius: px(30), borderWidth: 2, borderColor: "#FF7276" }} />
                    :
                    <View style={{ width: px(60), height: px(60), borderRadius: px(30), borderWidth: 2, borderColor: "#FF7276", marginRight: px(20) }}></View>
                }
            </View>
            <View style={{ flex: 0.13, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f2f2f2", width: "92%", marginTop: px(32), borderRadius: px(24), shadowColor: "black", shadowOffset: { height: 2, width: 2 }, shadowOpacity: 0.4 }}>
                <View style={{ marginLeft: px(16), width: px(150), height: "88%", justifyContent: "space-between" }}>
                    <Text>Hello, {concept.value.firstName}</Text>
                    <TouchableOpacity onPress={() => nav.navigate("Profile" as never)} style={{  }}>
                        <Text style={{ color: "#ff7276" }}>Complete your profile</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ marginRight: px(16), width: px(150), height: "90%", justifyContent: "space-between" }}>
                    <Text numberOfLines={2} adjustsFontSizeToFit style = {{ flexWrap: "wrap", maxHeight: px(27)}}>{location.value.address}</Text>
                    <TouchableOpacity onPress={() => nav.navigate("Map" as never)} style={{ marginTop: px(8) }}>
                        <Text style={{ color: "#ff7276" }}>Current location</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ flex: 1, justifyContent: "space-evenly", alignItems: "center", width: "100%" }}>
                <Text style={{ fontWeight: "bold", fontSize: px(32) }}>Are you in danger?</Text>
                <Text style={{ fontSize: px(12), color: "#808080", shadowColor: "black", shadowOpacity: 0.4, shadowOffset: { height: 2, width: 2 } }}>Press the button below to let us help you shortly</Text>
                <View style={{ height: px(300), position: "relative", top: px(20) }}>
                    <Animated.View style={{ backgroundColor: "#FFE7E9", padding: animatedPadding, borderRadius: px(150) }}>
                        <Animated.View style={{ backgroundColor: "#FFC6C4", padding: animatedPadding, borderRadius: px(150) }}>
                            <TouchableOpacity onPress={onSOSPress} style={{
                                alignItems: "center", justifyContent: "center", width: px(220), height: px(220), borderRadius: px(180), backgroundColor: "#FF7276"
                            }}>
                                <Text style={{ fontWeight: "bold", fontSize: px(32), color: "white" }}>SOS</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
                </View>
                <Text style={{ fontSize: px(14), color: "#808080", shadowColor: "black", shadowOpacity: 0.4, shadowOffset: { height: 2, width: 2 } }}>{showOptions ? "Tell us what happened to you" : ""}</Text>
                {showOptions ? <View style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                    {!optionsSelectedState.includes("accident") && <TouchableOpacity onPress={() => {
                        optionsSelected.current = [...optionsSelected.current, "accident"];
                        setOptionsSelectedState([...optionsSelectedState, "accident"]);
                    }} style={{ alignItems: "center", justifyContent: "center", backgroundColor: "#f2f2f2", width: px(101), height: px(56), marginTop: px(16), borderRadius: px(12), shadowColor: "black", shadowOffset: { height: 2, width: 2 }, shadowOpacity: 0.4 }}>
                        <Text style={{ fontSize: px(10), color: "black" }}>I had an accident</Text>
                    </TouchableOpacity>}
                    {!optionsSelectedState.includes("injury") && <TouchableOpacity onPress={() => {
                        optionsSelected.current = [...optionsSelected.current, "injury"];
                        setOptionsSelectedState([...optionsSelectedState, "injury"]);
                    }} style={{ alignItems: "center", justifyContent: "center", backgroundColor: "#f2f2f2", width: px(101), height: px(56), marginTop: px(16), borderRadius: px(12), shadowColor: "black", shadowOffset: { height: 2, width: 2 }, shadowOpacity: 0.4 }}>
                        <Text style={{ fontSize: px(10), color: "black" }}>I had an injury</Text>
                    </TouchableOpacity>}
                    {!optionsSelectedState.includes("following") && <TouchableOpacity onPress={() => {
                        optionsSelected.current = [...optionsSelected.current, "following"];
                        setOptionsSelectedState([...optionsSelectedState, "following"]);
                    }} style={{ alignItems: "center", justifyContent: "center", backgroundColor: "#f2f2f2", width: px(101), height: px(56), marginTop: px(16), borderRadius: px(12), shadowColor: "black", shadowOffset: { height: 2, width: 2 }, shadowOpacity: 0.4 }}>
                        <Text style={{ fontSize: px(10), color: "black", textAlign: "center" }}>I am followed by someone</Text>
                    </TouchableOpacity>}
                </View> : <View style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-around", height: px(70) }}></View>}
            </View>
        </View>
    );
}
