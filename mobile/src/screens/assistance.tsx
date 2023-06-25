import { TouchableOpacity, View, Text, TextInput, KeyboardAvoidingView, Alert, Keyboard, Image } from "react-native";
import { px } from "../hooks/utils";
import { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { baseUrl } from "../services/config";
import { LoginContext, initialConceptData } from "./common/login";
import { LocationContext } from "../../App";
import Toast from "react-native-root-toast";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function Assistance() {
    const [selectedOption, setSelectedOption] = useState<"Text" | "Video">("Text");
    const [message, setMessage] = useState("");
    const nav = useNavigation();
    const concept = useContext(LoginContext);
    const location = useContext(LocationContext);

    const onChangeText = (e: string) => {
        setMessage(e);
    }

    const onSend = () => {
        if (!message) {
            Toast.show("Please enter a message before sending.", {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM - 50,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 0,
                containerStyle: { borderRadius: 16, width: "90%" }
            });
        } else {
            const notifId = Math.floor(Math.random() * 100 + Math.random() * 34 + Math.random() * 24);
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
                    definedmessage: [message],
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
                setMessage("");
                Toast.show("Your assistance message has been sent. We will intercept it shortly.", {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.BOTTOM - 50,
                    shadow: true,
                    animation: true,
                    hideOnPress: true,
                    delay: 0,
                    containerStyle: { borderRadius: 16, width: "90%" }
                });
            })
                .catch(e => {
                    console.log(e);
                    Alert.alert("Error")
                });
        }
    }

    return <View style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ flex: 0.135, minHeight: 80, maxHeight: 80, flexDirection: "row", alignSelf: "center", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f2f2f2", width: "92%", marginTop: px(16), borderRadius: px(24), shadowColor: "black", shadowOffset: { height: 2, width: 2 }, shadowOpacity: 0.4 }}>
            <Text style={{ fontWeight: "bold", fontSize: px(16), marginLeft: 24 }}>Assistance</Text>
            {concept.value.image ?
                <Image source={{ uri: baseUrl + "/profile/" + concept.value.image }} style={{ marginRight: px(20), width: px(60), height: px(60), borderRadius: px(30), borderWidth: 2, borderColor: "#FF7276" }} />
                :
                <View style={{ width: px(60), height: px(60), borderRadius: px(30), borderWidth: 2, borderColor: "#FF7276", marginRight: px(20) }}></View>
            }
        </View>
        <Text style={{ marginTop: px(32), marginHorizontal: 24, fontSize: px(14), fontWeight: "600", textAlign: "center", shadowColor: "black", shadowOpacity: 0.3, shadowOffset: { width: 1, height: 1 } }}>We are here to help you with your urgency. Contact us either via text message or video sign language</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: px(32) }}>
            <TouchableOpacity onPress={() => setSelectedOption("Text")} style={{ paddingVertical: 20, paddingHorizontal: 48, borderRadius: 6, borderColor: "#ff7276", borderWidth: 1.5, borderStyle: "solid", backgroundColor: selectedOption === "Text" ? "#ff7276" : "transparent" }}>
                <Text style = {{color: selectedOption === "Text" ? "white" : "black"}}>Text</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedOption("Video")} style={{ paddingVertical: 20, paddingHorizontal: 48, borderRadius: 6, borderColor: "#ff7276", borderWidth: 1.5, borderStyle: "solid", backgroundColor: selectedOption === 'Video' ? "#ff7276" : "transparent" }}>
                <Text style = {{color: selectedOption === "Video" ? "white" : "black"}}>Video</Text>
            </TouchableOpacity>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }}>
            {selectedOption === "Text" && <View style={{ flex: 1 }}>
                <Text style={{ marginTop: px(32), fontSize: px(18), color: "#FF7276", fontWeight: "600", textAlign: "center", shadowColor: "black", shadowOpacity: 0.3, shadowOffset: { width: 1, height: 1 } }}>Please provide a text message in which you describe your needs.</Text>
                <TextInput
                    placeholder={"Please describe your issue"}
                    placeholderTextColor={"lightgray"}
                    textAlignVertical="top"
                    onChangeText={onChangeText}
                    value={message}
                    keyboardType="default"
                    returnKeyType="done"
                    multiline={true}
                    blurOnSubmit={true}
                    onSubmitEditing={()=>{Keyboard.dismiss()}}
                    maxLength={200}
                    style={[{ fontSize: px(15), color: "lightgray", height: px(95), borderColor: "lightgray", borderWidth: 1, padding: 8, marginVertical: 32, marginHorizontal: 24 }]} />
                <View style={{ flexGrow: 1 }} />
                <TouchableOpacity onPress={onSend} style={{ width: "80%", marginBottom: 24, borderRadius: 6, backgroundColor: "#ff7276", padding: 24, alignSelf: "center" }}>
                    <Text style={{ textAlign: "center", fontWeight: "600", color: "white", fontSize: 18 }}>SEND</Text>
                </TouchableOpacity>
            </View>
            }

            {selectedOption === "Video" && <View style={{ flex: 1 }}>
                <Text style={{ marginTop: px(32), fontSize: px(18), color: "#FF7276", fontWeight: "600", textAlign: "center", shadowColor: "black", shadowOpacity: 0.3, shadowOffset: { width: 1, height: 1 } }}>Please provide a video of yourself while using the american sign language.</Text>
                <Text style={{ marginTop: px(16), marginBottom: px(16), fontSize: px(16), color: "#808080", fontWeight: "400", shadowColor: "black", shadowOpacity: 0.3, shadowOffset: { width: 1, height: 1 }, textAlign: "center" }}>The video will be analyzed by the system and we will interpret your message.</Text>
                <View style={{ flexGrow: 1 }} />
                <TouchableOpacity onPress={() => nav.navigate("Record" as never)} style={{ width: "80%", marginBottom: 24, borderRadius: 6, backgroundColor: "#ff7276", padding: 24, alignSelf: "center" }}>
                    <Text style={{ textAlign: "center", fontWeight: "600", color: "white", fontSize: 18 }}>RECORD</Text>
                </TouchableOpacity>

            </View>}
        </KeyboardAvoidingView>
    </View>
}
