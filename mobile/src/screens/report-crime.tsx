import { TouchableOpacity, View, Text, TextInput, KeyboardAvoidingView, Alert, Keyboard, Dimensions, Image } from "react-native";
import { px } from "../hooks/utils";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { baseUrl } from "../services/config";
import { LoginContext, initialConceptData } from "./common/login";
import { LocationContext } from "../../App";
import Toast from "react-native-root-toast";
// @ts-ignore
import SelectableChips from 'react-native-chip/SelectableChips'
import { BarChart } from "react-native-chart-kit";
import { ScrollView } from "native-base";
import AsyncStorage from "@react-native-async-storage/async-storage";

const crimesArray = ["Assault", "Theft", "Violence",  "Harassment", "Burglary"];

export function ReportCrime() {
    const [selectedOption, setSelectedOption] = useState<"Report" | "Statistics">("Report");
    const [statistics, setStatistics] = useState<number[]>([]);
    const crimeTypes = useRef<string[]>([]);
    const [message, setMessage] = useState("");
    const nav = useNavigation();
    const concept = useContext(LoginContext);
    const location = useContext(LocationContext);

    useEffect(() => {
        if (selectedOption === "Statistics") {
            fetch(`${baseUrl}/notifications/getstatistics?latitude=${location.value.latitude}&longitude=${location.value.longitude}`, {
                headers: {
                    'x-access-token': `${concept.value.token}`
                }
            }).then(r => {
                if (r.status === 403) {
                    AsyncStorage.removeItem("userPayload");
                    concept.setValue(initialConceptData);
                    throw new Error("Error");
                }
                return r.json()
            })
            .then(result => {
                setStatistics(result.statistics);
            })
        }
    }, [selectedOption])

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
        } else if (!crimeTypes.current.length) {
            Toast.show("Please select a crime type before sending.", {
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
                    image: concept.value.image,
                    latitude: location.value.latitude,
                    longitude: location.value.longitude,
                    address: location.value.address,
                    definedmessage: [message],
                    crimetype: crimeTypes.current,
                    allergies: concept.value.allergies,
                    contacts: concept.value.contacts,
                    restrictedcontacts: concept.value.restrictedContacts,
                    notificationtype: "Crime report",
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
                crimeTypes.current = [];
                setSelectedOption("Statistics");
                Toast.show("Your report has been sent. We will intercept it shortly.", {
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
            <Text style={{ fontWeight: "bold", fontSize: px(16), marginLeft: 24 }}>Report crime</Text>
            {concept.value.image ?
            <Image source={{ uri: baseUrl + "/profile/" + concept.value.image }} style={{ marginRight: px(20), width: px(60), height: px(60), borderRadius: px(30), borderWidth: 2, borderColor: "#FF7276" }} />
            :
            <View style={{ width: px(60), height: px(60), borderRadius: px(30), borderWidth: 2, borderColor: "#FF7276", marginRight: px(20) }}></View>
            }
        </View>
        <Text style={{ marginTop: px(32), marginHorizontal: 24, fontSize: px(14), fontWeight: "600", textAlign: "center", shadowColor: "black", shadowOpacity: 0.3, shadowOffset: { width: 1, height: 1 } }}>An unreported crime may remain unpunished forever. {'\n\n'} Here you can report a crime if you witnessed one or check statistics about crime rate in your area</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: px(32) }}>
            <TouchableOpacity onPress={() => setSelectedOption("Report")} style={{ paddingVertical: 20, paddingHorizontal: 48, borderRadius: 6, borderColor: "#ff7276", borderWidth: 1.5, borderStyle: "solid", backgroundColor: selectedOption === "Report" ? "#ff7276" : "transparent" }}>
                <Text style = {{color: selectedOption === "Report" ? "white" : "black"}}>Report</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedOption("Statistics")} style={{ paddingVertical: 20, paddingHorizontal: 48, borderRadius: 6, borderColor: "#ff7276", borderWidth: 1.5, borderStyle: "solid", backgroundColor: selectedOption === 'Statistics' ? "#ff7276" : "transparent" }}>
                <Text style = {{color: selectedOption === "Statistics" ? "white" : "black"}}>Statistics</Text>
            </TouchableOpacity>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }}>
            {selectedOption === "Report" && <ScrollView style={{ flex: 1 }}>
                <Text style={{ marginTop: px(32), fontSize: px(18), color: "#FF7276", fontWeight: "600", textAlign: "center", shadowColor: "black", shadowOpacity: 0.3, shadowOffset: { width: 1, height: 1 } }}>Please describe in detail the crime you witnessed.</Text>
                <TextInput
                    placeholder={"Please describe the crime"}
                    placeholderTextColor={"lightgray"}
                    textAlignVertical="top"
                    onChangeText={onChangeText}
                    value={message}
                    keyboardType="default"
                    returnKeyType="done"
                    multiline={true}
                    blurOnSubmit={true}
                    onSubmitEditing={() => { Keyboard.dismiss() }}
                    maxLength={200}
                    style={[{ fontSize: px(15), color: "lightgray", height: px(95), borderColor: "lightgray", borderWidth: 1, padding: 8, marginVertical: 16, marginHorizontal: 24 }]} />
                <View style={{ flex: 1, marginHorizontal: px(24), flexDirection: "row", alignItems: "center", minHeight: px(60) }}>
                    <View style={{ marginHorizontal: px(0), marginBottom: px(16) }}>
                        <SelectableChips chipStyle={{ borderColor: "gray", marginLeft: px(12), paddingHorizontal: px(15) }} valueStyle={{ color: "black", fontSize: 16 }}
                            valueStyleSelected={{ color: "white", fontSize: 16 }} chipStyleSelected={{ backgroundColor: "#ff7276", borderColor: "white", marginLeft: px(12), paddingHorizontal: px(15) }}
                            initialChips={crimesArray} onChangeChips={(chips: any) => {
                                crimeTypes.current = chips;
                            }} alertRequired={false} />
                    </View>
                </View>
                <View style={{ flexGrow: 1 }} />
                <TouchableOpacity onPress={onSend} style={{ width: "80%", marginBottom: 24, borderRadius: 6, backgroundColor: "#ff7276", padding: 24, alignSelf: "center" }}>
                    <Text style={{ textAlign: "center", fontWeight: "600", color: "white", fontSize: 18 }}>SEND</Text>
                </TouchableOpacity>
            </ScrollView>
            }
            {selectedOption === "Statistics" && !!statistics.length && <View style={{ flex: 1, alignItems: "center"}}>
                <Text style={{ marginTop: px(32), marginBottom: px(32), fontSize: px(18), color: "#FF7276", fontWeight: "600", textAlign: "center", shadowColor: "black", shadowOpacity: 0.3, shadowOffset: { width: 1, height: 1 } }}>Crime rates in a range of 5 km from your location.</Text>
                <BarChart
                data={{
                    labels: crimesArray,
                    datasets: [
                    {
                        data: statistics ?? []
                    }
                    ]
                }}
                width={Dimensions.get("window").width - px(40)}
                height={220}
                yAxisLabel={""}
                yLabelsOffset={27}
                yAxisSuffix=""
                segments={Math.max(...statistics) >= 5 ? 4 : Math.max(...statistics)}
                yAxisInterval={1}
                fromZero
                
                chartConfig={{
                    propsForVerticalLabels: {
                        fontSize: 10
                    },
                    barPercentage: 0.7,
                    backgroundColor: "#ffcccb",
                    backgroundGradientFrom: "#ff5555",
                    backgroundGradientTo: "#ffa726",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                    borderRadius: 16,
                    },
                    propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                    }
                }}
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}

                />
                <View style={{ flexGrow: 1 }} />
            </View>}
        </KeyboardAvoidingView>
    </View>
}
