import { Fontisto, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { Box, FormControl, Input, ScrollView, TextArea } from "native-base";
import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, Alert, Modal, StyleSheet, Image } from "react-native";
import { px } from "../hooks/utils";
import { Contact, LoginContext, initialConceptData } from "./common/login";
// @ts-ignore
import call from 'react-native-phone-call'
import * as ImagePicker from 'expo-image-picker';
import CircularProgress from 'react-native-circular-progress-indicator';
import moment from "moment";
import { baseUrl } from "../services/config";
import axios from "axios";
import Toast from "react-native-root-toast";
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from '@expo/vector-icons';

type PersonalInfo = {
    firstName: string;
    lastName: string;
    phone: string;
    birthDate: string;
}

export function ProfileScreen() {
    const concept = useContext(LoginContext);
    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const [bloodTypeModalVisible, setBloodTypeModalVisible] = useState(false);
    const [alergiesModalVisible, setAlergiesModalVisible] = useState(false);
    const [contactsModalVisible, setContactsModalVisible] = useState(false);
    const [contactModalVisible, setContactModalVisible] = useState(false);
    const [contactPhotoModalVisible, setContactPhotoModalVisible] = useState(false);
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [date, setDate] = useState(concept.value.birthDate ? moment(concept.value.birthDate).toDate() : new Date());
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        firstName: concept.value.firstName ?? "",
        lastName: concept.value.lastName ?? "",
        phone: concept.value.phoneNumber ?? "",
        birthDate: concept.value.birthDate ?? "",
    });
    const [errors, setErrors] = useState<PersonalInfo>({
        firstName: "",
        lastName: "",
        phone: "",
        birthDate: "",
    });
    const [personalInfoPhoto, setPersonalInfoPhoto] = useState<null | string>(baseUrl + '/profile/' + concept.value.image);
    const [bloodType, setBloodType] = useState<"O1" | "A2" | "B3" | "AB4" | undefined>(
        (concept.value.bloodType ?? "").startsWith("O1") ? "O1" : (concept.value.bloodType ?? "").startsWith("A2") ? "A2" : (concept.value.bloodType ?? "").startsWith("B3") ? "B3" :
        (concept.value.bloodType ?? "").startsWith("AB4") ? "AB4" : undefined
    );
    const [contactDetails, setContactDetails] = useState({
        id: -1,
        firstName: "",
        lastName: "",
        phone: "",
        photo: "",
        type: ""
    });

    const [rh, setRh] = useState<"+" | "-" | undefined>(
        (concept.value.bloodType ?? "").endsWith("+") ? "+" : (concept.value.bloodType ?? "").endsWith("-") ? "-" : undefined
    );
    const [foodAllergies, setFoodAllergies] = useState<string | null>(concept.value.allergies.food);
    const [medicationAllergies, setMedicationAllergies] = useState<string | null>(concept.value.allergies.medication);
    const [foodAllergyText, setFoodAllergyText] = useState(concept.value.allergies.food);
    const [medicationAllergyText, setMedicationAllergyText] = useState(concept.value.allergies.medication);
    const [otherAllergyText, setOtherAllergyText] = useState(concept.value.allergies.other);

    const [contactDetailsSnapshot, setContactDetailsSnapshot] = useState<any>();
    const [keyboardAvoidingPadding, setKeyboardAvoidingPadding] = useState(0);

    const onChangeText = (text: string, setState: (value: string) => void) => {
        setState(text);
    }

    const onSubmit = () => {
        fetch(`${baseUrl}/user/updatepersonalinfo`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': `${concept.value.token}`
            },
            body: JSON.stringify({
                id: concept.value.id,
                firstname: personalInfo.firstName,
                lastname: personalInfo.lastName,
                phonenumber: personalInfo.phone,
                birthdate: moment(date).format()
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
            concept.setValue({...res, token: concept.value.token});
            setDate(moment(res.birthDate).toDate());
        })
            .catch(e => {
                Alert.alert("Internal server error!");
            })
        const body = new FormData();
        body.append('file', {
            uri: personalInfoPhoto,
            type: "video/mp4",
            name: personalInfoPhoto?.split("/").pop()
        } as any);
        body.append('id', concept.value.id)
        body.append('type', contactDetails.type)
        axios({
            method: "post",
            url: `${baseUrl}/user/updateprofileimage`,
            data: body,
            headers: { 
                "Content-Type": "multipart/form-data",
                'x-access-token': `${concept.value.token}`
             },
        }).then(res => {
            if (res.status === 403) {
                AsyncStorage.removeItem("userPayload");
                concept.setValue(initialConceptData);
                throw new Error("Error");
            }
            concept.setValue({...res.data, token: concept.value.token});
            setInfoModalVisible(!infoModalVisible)
            Toast.show("Personal information updated successfully", {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM - 50,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 0,
                containerStyle: { borderRadius: 16, width: "90%" }
            });
        })
    }

    return <View style={{ backgroundColor: "white", }}>
        <ScrollView style={{}}>
            <View style={{ marginHorizontal: px(16), height: px(90), flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f2f2f2", marginTop: px(16), borderRadius: px(24), shadowColor: "black", shadowOffset: { height: 2, width: 2 }, shadowOpacity: 0.4 }}>
                {concept.value.image ?
                    <Image source={{ uri: baseUrl + "/profile/" + concept.value.image }} style={{ marginLeft: px(8), width: px(60), height: px(60), borderRadius: px(30), borderWidth: 2, borderColor: "#FF7276", marginRight: px(20) }} />
                    : <View style={{ marginLeft: px(8), width: px(60), height: px(60), borderRadius: px(30), borderWidth: 2, borderColor: "#FF7276", marginRight: px(20) }}></View>
                }
                <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", fontSize: px(16) }}>{concept.value.firstName} {concept.value.lastName}</Text>
                    <Text style={{ fontSize: px(12), color: '#808080' }}>{concept.value.birthDate ? moment(concept.value.birthDate).format("DD MMM YYYY") : "No birthdate set"}</Text>
                </View>
                <TouchableOpacity style= {{ marginLeft: px(8), width: px(60), height: px(60), borderRadius: px(30), borderWidth: 2, borderColor: "#FF7276", marginRight: px(20), flex: 0.5, justifyContent: "center", alignItems:"center"}} onPress={() => {
                    AsyncStorage.removeItem("userPayload");
                    concept.setValue(initialConceptData);
                }}>
            <AntDesign name="logout" size={24} color="#FF7276" />
                </TouchableOpacity>
                <View style={{ marginRight: px(20) }}>
                    <CircularProgress value={concept.value.progress}
                        valueSuffix="%"
                        progressValueStyle={{ fontSize: px(14) }}
                        radius={30}
                        duration={0}
                        progressValueColor={'#808080'}
                        activeStrokeColor="#FF0000"
                        inActiveStrokeColor="#FF7276"
                        maxValue={100}
                    />
                    <Text style={{ fontSize: px(12), color: '#808080' }}>Completed</Text>
                </View>
            </View>
            <View style={{ marginHorizontal: px(16), height: px(150), flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f2f2f2", marginTop: px(12), borderRadius: px(24), shadowColor: "black", shadowOffset: { height: 2, width: 2 }, shadowOpacity: 0.4 }}>
                <TouchableOpacity onPress={() => setInfoModalVisible(true)} style={{ marginLeft: px(12), borderRadius: px(12), borderWidth: px(0.5), borderColor: 'black', width: px(110), height: px(120), justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialCommunityIcons color="#FF7276" size={px(48)} name="information-outline" />
                    <Text style={{ marginTop: px(18), color: "#808080" }}>Personal info</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setBloodTypeModalVisible(true)} style={{ borderRadius: px(12), borderWidth: px(0.5), borderColor: 'black', width: px(110), height: px(120), justifyContent: 'center', alignItems: 'center' }}>
                    <Fontisto color="#FF7276" size={px(48)} name="blood-drop" />
                    <Text style={{ marginTop: px(18), color: "#808080" }}>Blood Group</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setAlergiesModalVisible(true)} style={{ marginRight: px(12), borderRadius: px(12), borderWidth: px(0.5), borderColor: 'black', width: px(110), height: px(120), justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialCommunityIcons color="#FF7276" size={px(48)} name="hospital-box-outline" />
                    <Text style={{ marginTop: px(18), color: "#808080" }}>Allergies</Text>
                </TouchableOpacity>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={infoModalVisible}
                onRequestClose={() => {
                    setInfoModalVisible(!infoModalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{}}>
                            <Image source={require("../../assets/personal-information.jpg")} style={{ width: px(150), height: px(150) }} />
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: px(30), borderTopLeftRadius: px(32), borderTopRightRadius: px(32), backgroundColor: "#f2f2f2", shadowColor: "black", shadowOpacity: 0.8, shadowOffset: { width: 2, height: 2 } }}>
                            <Text style={{ fontSize: px(32), fontWeight: "bold", marginTop: px(8) }}>Personal Information</Text>
                            <View style={{ marginTop: px(24) }} />
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: px(24) }}>
                                {personalInfoPhoto ?
                                    <Image source={{ uri: personalInfoPhoto }} style={{ width: px(100), height: px(100), borderWidth: px(2), borderRadius: px(50), borderColor: "#FF7276" }} />
                                    :
                                    <View style={{ justifyContent: 'center', borderWidth: px(2), borderColor: "#808080", borderRadius: px(100), width: px(100), height: px(100) }}>
                                        <MaterialCommunityIcons style={{ alignSelf: "center", marginBottom: px(7) }}
                                            name="account"
                                            size={px(72)}
                                            color="#808080" />
                                    </View>}
                                <Text style={{ fontSize: px(14), color: "#808080", fontWeight: "600", width: px(160), paddingLeft: px(24) }}>Select your image</Text>
                                <TouchableOpacity style={{ height: px(48), width: px(48) }} onPress={async () => {
                                    let result = await ImagePicker.launchImageLibraryAsync({
                                        mediaTypes: ImagePicker.MediaTypeOptions.All,
                                        allowsEditing: true,
                                        aspect: [4, 3],
                                        quality: 1,
                                    });
                                    if (!result.canceled) {
                                        setPersonalInfoPhoto(result.assets[0].uri);
                                    }
                                }}>
                                    <MaterialIcons style={{ alignSelf: 'center', color: '#808080' }} color="#808080" size={px(48)} name="add-a-photo" />
                                </TouchableOpacity>
                            </View>
                            <Input
                                leftElement={<MaterialCommunityIcons style={{ marginLeft: px(10) }}
                                    name="account"
                                    size={px(24)}
                                    color="#808080" />}
                                height={px(40)}
                                value={personalInfo.firstName}
                                borderRadius={px(24)}
                                _focus={{ style: { backgroundColor: "#F8F8F8" } }}
                                placeholder="First name"
                                onChangeText={value => setPersonalInfo({
                                    ...personalInfo,
                                    firstName: value
                                })}
                            />
                            {errors.firstName.length ? <FormControl.ErrorMessage>{errors.firstName}</FormControl.ErrorMessage> : <></>}
                            {''}
                            <View style={{ marginTop: px(24) }} />
                            <Input
                                leftElement={<MaterialCommunityIcons style={{ marginLeft: px(10) }}
                                    name="account"
                                    size={px(24)}
                                    color="#808080" />}
                                height={px(40)}
                                value={personalInfo.lastName}
                                borderRadius={px(24)}
                                _focus={{ style: { backgroundColor: "#F8F8F8" } }}
                                placeholder="Last name"
                                onChangeText={value => setPersonalInfo({
                                    ...personalInfo,
                                    lastName: value
                                })} />
                            {''}
                            {errors.lastName.length ? <FormControl.ErrorMessage>{errors.lastName}</FormControl.ErrorMessage> : <></>}
                            <View style={{ marginTop: px(24) }} />
                            <Input
                                leftElement={<MaterialCommunityIcons style={{ marginLeft: px(10) }}
                                    name="phone"
                                    size={px(24)}
                                    color="#808080" />}
                                height={px(40)}
                                value={personalInfo.phone}
                                keyboardType="numeric"
                                borderRadius={px(24)}
                                _focus={{ style: { backgroundColor: "#F8F8F8" } }}
                                placeholder="Phone number"
                                onChangeText={value => {
                                    setPersonalInfo({
                                        ...personalInfo,
                                        phone: value
                                    });
                                }} />
                            {errors.phone.length ? <FormControl.ErrorMessage>{errors.phone}</FormControl.ErrorMessage> : <></>}
                            <View style={{ marginTop: px(24) }} />
                            <View style={{ flexDirection: 'row', borderColor: 'lightgray', borderWidth: px(1), width: 300, borderRadius: px(20) }}>
                                <MaterialCommunityIcons style={{ marginTop: px(6), marginLeft: px(10) }} name="calendar-multiselect" size={px(28)} color="#808080" />
                                <RNDateTimePicker
                                    mode="date"
                                    value={date}
                                    maximumDate={new Date()}
                                    minimumDate={new Date(1950, 1, 1)}
                                    onChange={(event, value) => {
                                        setDate(value!);
                                    }}
                                    style={{ backgroundColor: 'transparent', opacity: 0.2 }}
                                    textColor={"#808080"}
                                    themeVariant={"light"}
                                />
                            </View>
                            {errors.birthDate.length ? <FormControl.ErrorMessage>Date is invalid</FormControl.ErrorMessage> : <></>}
                            <View style={{ marginTop: px(24) }} />
                            <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: px(24) }}>
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={() => onSubmit()}
                                >
                                    <Text style={styles.textStyle}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={() => setInfoModalVisible(!infoModalVisible)}
                                >
                                    <Text style={styles.textStyle}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={bloodTypeModalVisible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setBloodTypeModalVisible(!bloodTypeModalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, { width: "92%", flexDirection: "column" }]}>
                        <Image source={require("../../assets/blood-type.jpg")} style={{ width: px(180), height: px(180) }} />
                        <View style={{ borderRadius: px(24), backgroundColor: "#f2f2f2", width: "100%", marginTop: px(-32) }}>
                            <Text style={{ fontSize: px(24), marginTop: px(16), fontWeight: "bold", textAlign: "center" }}>Pick your blood group</Text>
                            <View style={{ flexDirection: "row", justifyContent: "space-around", flexWrap: "wrap" }}>
                                <TouchableOpacity onPress={() => setBloodType("O1")} style={{ marginTop: px(24), alignItems: "center", justifyContent: "center", width: px(140), height: px(110), borderRadius: px(12), backgroundColor: bloodType === "O1" ? "#FF7276" : "#FFB6C1" }}>
                                    <Text style={{ fontWeight: "600", color: "white", fontSize: px(42) }}>O1</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setBloodType("A2")} style={{ marginTop: px(24), alignItems: "center", justifyContent: "center", width: px(140), height: px(110), borderRadius: px(12), backgroundColor: bloodType === "A2" ? "#FF7276" : "#FFB6C1" }}>
                                    <Text style={{ fontWeight: "600", color: "white", fontSize: px(42) }}>A2</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setBloodType("B3")} style={{ marginTop: px(24), alignItems: "center", justifyContent: "center", width: px(140), height: px(110), borderRadius: px(12), backgroundColor: bloodType === "B3" ? "#FF7276" : "#FFB6C1" }}>
                                    <Text style={{ fontWeight: "600", color: "white", fontSize: px(42) }}>B3</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setBloodType("AB4")} style={{ marginTop: px(24), alignItems: "center", justifyContent: "center", width: px(140), height: px(110), borderRadius: px(12), backgroundColor: bloodType === "AB4" ? "#FF7276" : "#FFB6C1" }}>
                                    <Text style={{ fontWeight: "600", color: "white", fontSize: px(42) }}>AB4</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "center" }}>
                                <TouchableOpacity onPress={() => setRh("+")} style={{ marginTop: px(24), alignItems: "center", justifyContent: "center", width: px(50), height: px(50), borderRadius: px(8), backgroundColor: rh === "+" ? "#FF7276" : "#FFB6C1" }}>
                                    <Text style={{ fontWeight: "600", color: "white", fontSize: px(24) }}>+</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setRh("-")} style={{ marginLeft: px(16), marginTop: px(24), alignItems: "center", justifyContent: "center", width: px(50), height: px(50), borderRadius: px(8), backgroundColor: rh === "-" ? "#FF7276" : "#FFB6C1" }}>
                                    <Text style={{ fontWeight: "600", color: "white", fontSize: px(24) }}>-</Text>
                                </TouchableOpacity>

                            </View>
                            <View style={{ justifyContent: "space-around", flexDirection: "row", paddingBottom: px(48), marginTop: px(24) }}>
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={() => {
                                        fetch(`${baseUrl}/user/updatebloodtype`, {
                                            method: 'PUT',
                                            headers: {
                                                'Accept': 'application/json',
                                                'Content-Type': 'application/json',
                                                'x-access-token': `${concept.value.token}`
                                            },
                                            body: JSON.stringify({
                                                id: concept.value.id,
                                                bloodtype: bloodType!.concat(rh!) as string
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
                                            concept.setValue({...res, token: concept.value.token});
                                            setBloodType((res.bloodType ?? "").startsWith("O1") ? "O1" : (res.bloodType ?? "").startsWith("A2") ? "A2" : (res.bloodType ?? "").startsWith("B3") ? "B3" :
                                                (res.bloodType ?? "").startsWith("AB4") ? "AB4" : undefined);
                                            setRh((res.bloodType ?? "").endsWith("+") ? "+" : (res.bloodType ?? "").endsWith("-") ? "-" : undefined)
                                        })
                                            .catch(e => {
                                                Alert.alert("Internal server error!");
                                            })
                                        setBloodTypeModalVisible(!bloodTypeModalVisible);
                                    }}
                                >
                                    <Text style={styles.textStyle}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonClose, {}]}
                                    onPress={() => setBloodTypeModalVisible(!bloodTypeModalVisible)}
                                >
                                    <Text style={styles.textStyle}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={alergiesModalVisible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setAlergiesModalVisible(!alergiesModalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, { }]}>
                        <ScrollView showsVerticalScrollIndicator={false} style={{}}>
                            <View style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                                <Image source={require("../../assets/allergies.png")} style={{ width: px(150), height: px(150), marginTop: px(12) }} />
                            </View>
                            <View style={{ borderRadius: px(24), backgroundColor: "#f2f2f2", width: "100%", marginTop: px(12) }}>
                                <Text style={{ marginTop: px(32), marginHorizontal: 100, fontSize: px(14), fontWeight: "600", textAlign: "center", shadowColor: "black", shadowOpacity: 0.3, shadowOffset: { width: 1, height: 1 } }}>
                                    Please fill in your allergies information
                                </Text>
                                <View style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                    <Text style={{ marginLeft: px(50), marginTop: px(24) }}>Do you have any food allergies?</Text>
                                    <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: px(32) }}>
                                        <TouchableOpacity onPress={() => setFoodAllergies("food")} style={{ paddingVertical: 20, paddingHorizontal: 48, borderRadius: 6, borderColor: "#ff7276", borderWidth: 1.5, borderStyle: "solid", backgroundColor: foodAllergies === "food" ? "#ff7276" : "transparent" }}>
                                            <Text style = {{color: (foodAllergies !== null && foodAllergies !== "")  ? "white" : "black"}}>YES</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setFoodAllergies("")} style={{ paddingVertical: 20, paddingHorizontal: 48, borderRadius: 6, borderColor: "#ff7276", borderWidth: 1.5, borderStyle: "solid", backgroundColor: foodAllergies === "" ? "#ff7276" : "transparent" }}>
                                            <Text style = {{color: foodAllergies === "" ? "white" : "black"}}>NO</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {foodAllergies ? <Box alignItems="center" w="100%" style={{ marginTop: px(24), }}>
                                        <TextArea onFocus={() => setKeyboardAvoidingPadding(170)} onBlur={() => setKeyboardAvoidingPadding(0)} value={foodAllergyText} onChangeText={(val) => onChangeText(val, setFoodAllergyText)} autoCompleteType={null} placeholder="Your food allergies" maxW="288" />
                                    </Box> : <Box alignItems="center" w="100%" style={{ marginTop: px(24) }}>
                                    </Box>}
                                    <Text style={{ marginLeft: px(50), marginTop: px(foodAllergies ? 24 : 0) }}>Do you have any medication allergies?</Text>
                                    <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: px(32) }}>
                                        <TouchableOpacity onPress={() => setMedicationAllergies("medication")} style={{ paddingVertical: 20, paddingHorizontal: 48, borderRadius: 6, borderColor: "#ff7276", borderWidth: 1.5, borderStyle: "solid", backgroundColor: medicationAllergies === "medication" ? "#ff7276" : "transparent" }}>
                                            <Text style = {{color: (medicationAllergies !== null && medicationAllergies !== "") ? "white" : "black"}}>YES</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setMedicationAllergies("")} style={{ paddingVertical: 20, paddingHorizontal: 48, borderRadius: 6, borderColor: "#ff7276", borderWidth: 1.5, borderStyle: "solid", backgroundColor: medicationAllergies === "" ? "#ff7276" : "transparent" }}>
                                            <Text style = {{color: medicationAllergies === "" ? "white" : "black"}}>NO</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {medicationAllergies ? <Box alignItems="center" w="100%" style={{ marginTop: px(24), }}>
                                        <TextArea onFocus={() => setKeyboardAvoidingPadding(170)} onBlur={() => setKeyboardAvoidingPadding(0)} value={medicationAllergyText} onChangeText={(val) => onChangeText(val, setMedicationAllergyText)} autoCompleteType={null} placeholder="Your food allergies" maxW="288" />
                                    </Box> : <Box alignItems="center" w="100%" style={{ marginTop: px(24) }}>
                                    </Box>}
                                </View>
                                <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginBottom: px(24) }}>
                                    <Text style={{ marginLeft: px(50), marginTop: px(medicationAllergies ? 24 : 0) }}>Please fill in other allergy or medical information</Text>
                                    <Box alignItems="center" w="100%" style={{ marginTop: px(24), }}>
                                        <TextArea onFocus={() => setKeyboardAvoidingPadding(170)} onBlur={() => setKeyboardAvoidingPadding(0)} value={otherAllergyText} onChangeText={(val) => onChangeText(val, setOtherAllergyText)} autoCompleteType={null} placeholder="Other allergies or medical information" maxW="288" />
                                    </Box>
                                    <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: px(24) }}>
                                        <TouchableOpacity
                                            style={[styles.button, styles.buttonClose]}
                                            onPress={() => {
                                                fetch(`${baseUrl}/user/updateallergies`, {
                                                    method: 'PUT',
                                                    headers: {
                                                        'Accept': 'application/json',
                                                        'Content-Type': 'application/json',
                                                        'x-access-token': `${concept.value.token}`
                                                    },
                                                    body: JSON.stringify({
                                                        id: concept.value.id,
                                                        allergies: {
                                                            food: foodAllergies !== "" ? foodAllergyText : foodAllergies === "" ? "" : null,
                                                            medication: medicationAllergies !== "" ? medicationAllergies : medicationAllergies === "" ? "" : null,
                                                            other: otherAllergyText
                                                        }
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
                                                    concept.setValue({...res, token: concept.value.token});
                                                })
                                                    .catch(e => {
                                                        Alert.alert("Internal server error!");
                                                    })
                                                setAlergiesModalVisible(!alergiesModalVisible)
                                            }}
                                        >
                                            <Text style={styles.textStyle}>Save</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.button, styles.buttonClose]}
                                            onPress={() => setAlergiesModalVisible(!alergiesModalVisible)}
                                        >
                                            <Text style={styles.textStyle}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <View style={{ flexDirection: 'column', justifyContent: 'center', marginTop: px(32), marginBottom: px(16) }}>
                <Text style={{ color: 'black', marginLeft: px(16), fontSize: px(16), fontWeight: "600" }}>Quick contacts</Text>
                <ContactComponent type="quick" contactsArray={concept.value.contacts} setContactDetails={setContactDetails} setContactDetailsSnapshot={setContactDetailsSnapshot} setContactModalVisible={setContactModalVisible} setContactsModalVisible={setContactsModalVisible} />
                <Text style={{ color: 'black', marginLeft: px(16), fontSize: px(16), fontWeight: "600", marginTop: px(24) }}>Restricted contacts</Text>
                <ContactComponent type="restricted" contactsArray={concept.value.restrictedContacts} setContactDetails={setContactDetails} setContactDetailsSnapshot={setContactDetailsSnapshot} setContactModalVisible={setContactModalVisible} setContactsModalVisible={setContactsModalVisible} />
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={contactsModalVisible}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                        setContactsModalVisible(!contactsModalVisible);
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <TouchableOpacity onPress={() => setContactPhotoModalVisible(true)} style={{ marginLeft: px(8), marginTop: px(24) }}>
                                {contactDetails.photo || image?.uri ?
                                    <Image source={{ uri: image?.uri ? image.uri : (baseUrl + "/contact-photos/" + contactDetails.photo) }} style={{ opacity: contactDetails.type === "quick" ? 1 : 0.4, marginTop: px(24), width: px(148), height: px(148), borderRadius: px(75), borderWidth: 2, borderColor: "#FF7276", marginRight: px(20) }}></Image>
                                    :
                                    <View style={{ marginTop: px(24), width: px(150), height: px(150), borderRadius: px(75), borderWidth: 2, borderColor: "#FF7276", marginRight: px(20) }}></View>}
                            </TouchableOpacity>
                            <Text style={{ marginTop: px(24), color: '#808080', fontSize: px(24), fontWeight: '400' }}>{contactDetails.firstName} {contactDetails.lastName}</Text>
                            <Text style={{ marginTop: px(24), color: '#808080', fontSize: px(18), fontWeight: '400' }}>{contactDetails.phone}</Text>
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', width: px(350) }}>
                                <View>
                                    <TouchableOpacity onPress={() => setContactModalVisible(true)} style={{ marginTop: px(24), borderWidth: px(0.5), borderColor: "#808080", padding: px(12), borderRadius: px(12) }}>
                                        <Text>Change contact details</Text>
                                    </TouchableOpacity>
                                </View>
                                {contactDetails.type === "quick" && <View>
                                    <TouchableOpacity onPress={() => {
                                        const args = {
                                            number: '+40722260058',
                                            prompt: true,
                                            skipCanOpen: true
                                        }
                                        call(args).catch(console.error)
                                    }} style={{ flex: 0.31, justifyContent: 'center', marginTop: px(12), borderWidth: px(1), borderColor: "#808080", borderRadius: px(50), width: px(100), height: px(100) }}>
                                        <MaterialCommunityIcons style={{ alignSelf: 'center', color: '#FF7276' }} name="phone" size={px(48)} />
                                    </TouchableOpacity>
                                </View>}
                            </View>

                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={contactPhotoModalVisible}
                                onRequestClose={() => {
                                    Alert.alert("Modal has been closed.");
                                    setContactPhotoModalVisible(!contactPhotoModalVisible);
                                }}
                            >
                                <View style={styles.centeredView}>
                                    <View style={styles.modalView1}>
                                        <Text>Choose photo from library</Text>
                                        <TouchableOpacity onPress={async () => {
                                            let result = await ImagePicker.launchImageLibraryAsync({
                                                mediaTypes: ImagePicker.MediaTypeOptions.All,
                                                allowsEditing: true,
                                                aspect: [4, 3],
                                                quality: 1,
                                            });
                                            if (!result.canceled) {
                                                setImage(result.assets[0]);
                                            }
                                        }} style={{ justifyContent: 'center', alignItems: "center", marginTop: px(24), borderWidth: px(2), borderColor: "#808080", borderRadius: px(100), width: px(100), height: px(100) }}>
                                            <MaterialIcons style={{ alignSelf: 'center', color: '#808080' }} color="#808080" size={px(64)} name="add-a-photo" />
                                        </TouchableOpacity>
                                        <View style={{ width: px(300), marginTop: px(24), flex: 1, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <TouchableOpacity
                                                style={[styles.button, styles.buttonClose]}
                                                onPress={() => {
                                                    const newContactId = Math.floor(Math.random() * 100 + Math.random() * 34 + Math.random() * 24);
                                                    const body = new FormData();
                                                    body.append('file', {
                                                        uri: image!.uri,
                                                        type: "video/mp4",
                                                        name: image!.uri?.split("/").pop()
                                                    } as any);
                                                    body.append('id', concept.value.id)
                                                    body.append('contactId', contactDetails.id !== -1 ? String(contactDetails.id.toString()) : String(newContactId))
                                                    body.append('type', contactDetails.type)
                                                    axios({
                                                        method: "put",
                                                        url: `${baseUrl}/user/updatecontactphoto`,
                                                        data: body,
                                                        headers: { 
                                                            "Content-Type": "multipart/form-data",
                                                            'x-access-token': `${concept.value.token}`
                                                         },
                                                    }).then(res => {
                                                        if (res.status === 403) {
                                                            AsyncStorage.removeItem("userPayload");
                                                            concept.setValue(initialConceptData);
                                                            throw new Error("Error");
                                                        }
                                                        setContactPhotoModalVisible(!contactPhotoModalVisible);
                                                        concept.setValue({...res.data, token: concept.value.token});
                                                        setContactDetails({ ...contactDetails, photo: image?.uri.split("/").pop()! })
                                                        Toast.show("Image updated successfully", {
                                                            duration: Toast.durations.LONG,
                                                            position: Toast.positions.BOTTOM - 50,
                                                            shadow: true,
                                                            animation: true,
                                                            hideOnPress: true,
                                                            delay: 0,
                                                            containerStyle: { borderRadius: 16, width: "90%" }
                                                        });
                                                    })
                                                }}
                                            >
                                                <Text style={styles.textStyle}>Save</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.button, styles.buttonClose]}
                                                onPress={() => {
                                                    setContactPhotoModalVisible(!contactPhotoModalVisible);
                                                    setImage(null);
                                                }}
                                            >
                                                <Text style={styles.textStyle}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={contactModalVisible}
                                onRequestClose={() => {
                                    Alert.alert("Modal has been closed.");
                                    setContactModalVisible(!contactModalVisible);
                                }}
                            >
                                <View style={styles.centeredView}>
                                    <View style={[styles.modalView1, { paddingTop: 0, paddingBottom: 0, flexGrow: 1, marginTop: (350 - keyboardAvoidingPadding) }]}>
                                        <View style={{}}>
                                            <Image source={require("../../assets/personal-information.jpg")} style={{ width: px(150), height: px(150) }} />
                                        </View>
                                        <Input
                                            leftElement={<MaterialCommunityIcons style={{ marginLeft: px(10) }}
                                                name="account"
                                                size={px(24)}
                                                color="#808080" />}
                                            height={px(40)}
                                            value={contactDetails.firstName}
                                            borderRadius={px(24)}
                                            onFocus={() => setKeyboardAvoidingPadding(170)}
                                            onBlur={() => setKeyboardAvoidingPadding(0)}
                                            _focus={{ style: { backgroundColor: "#F8F8F8" } }}
                                            placeholder="First name"
                                            onChangeText={value => setContactDetails({
                                                ...contactDetails,
                                                firstName: value
                                            })}
                                        />
                                        {''}
                                        <View style={{ marginTop: px(24) }} />
                                        <Input
                                            leftElement={<MaterialCommunityIcons style={{ marginLeft: px(10) }}
                                                name="account"
                                                size={px(24)}
                                                color="#808080" />}
                                            height={px(40)}
                                            value={contactDetails.lastName}
                                            borderRadius={px(24)}
                                            onFocus={() => setKeyboardAvoidingPadding(170)}
                                            onBlur={() => setKeyboardAvoidingPadding(0)}
                                            _focus={{ style: { backgroundColor: "#F8F8F8" } }}
                                            placeholder="Last name"
                                            onChangeText={value => setContactDetails({
                                                ...contactDetails,
                                                lastName: value
                                            })} />
                                        {''}
                                        <View style={{ marginTop: px(24) }} />
                                        <Input
                                            leftElement={<MaterialCommunityIcons style={{ marginLeft: px(10) }}
                                                name="phone"
                                                size={px(24)}
                                                color="#808080" />}
                                            height={px(40)}
                                            onFocus={() => setKeyboardAvoidingPadding(170)}
                                            onBlur={() => setKeyboardAvoidingPadding(0)}
                                            value={contactDetails.phone}
                                            keyboardType="numeric"
                                            borderRadius={px(24)}
                                            _focus={{ style: { backgroundColor: "#F8F8F8" } }}
                                            placeholder="Phone number"
                                            onChangeText={value => {
                                                setContactDetails({
                                                    ...contactDetails,
                                                    phone: value
                                                });
                                            }} />
                                        {errors.phone.length ? <FormControl.ErrorMessage>{errors.phone}</FormControl.ErrorMessage> : <></>}
                                        <View style={{ marginTop: px(24) }} />
                                        <View style={{ flexDirection: "row", justifyContent: "space-around", width: px(250), }}>
                                            <TouchableOpacity
                                                style={[styles.button, styles.buttonClose]}
                                                onPress={() => {
                                                    const newContactId = Math.floor(Math.random() * 100 + Math.random() * 34 + Math.random() * 24);
                                                    fetch(`${baseUrl}/user/editquickcontact`, {
                                                        method: 'PUT',
                                                        headers: {
                                                            'Accept': 'application/json',
                                                            'Content-Type': 'application/json',
                                                            'x-access-token': `${concept.value.token}`
                                                        },
                                                        body: JSON.stringify({
                                                            id: concept.value.id,
                                                            contact: {
                                                                id: contactDetails.id !== -1 ? contactDetails.id : newContactId,
                                                                firstname: contactDetails.firstName,
                                                                lastname: contactDetails.lastName,
                                                                phone: contactDetails.phone,
                                                                photo: contactDetails.photo,
                                                            },
                                                            type: contactDetails.type
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
                                                        setContactDetailsSnapshot({
                                                            id: contactDetails.id !== -1 ? contactDetails.id : newContactId,
                                                            firstName: contactDetails.firstName,
                                                            lastName: contactDetails.lastName,
                                                            phone: contactDetails.phone,
                                                            photo: contactDetails.photo,
                                                            type: contactDetails.type
                                                        })
                                                        concept.setValue({...res, token: concept.value.token});
                                                    })
                                                        .catch(e => {
                                                            Alert.alert("Internal server error!");
                                                        })
                                                    setContactModalVisible(!contactModalVisible);
                                                }}
                                            >
                                                <Text style={styles.textStyle}>Save</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.button, styles.buttonClose]}
                                                onPress={() => {
                                                    setContactDetails(contactDetailsSnapshot);
                                                    setContactModalVisible(!contactModalVisible);
                                                }}
                                            >
                                                <Text style={styles.textStyle}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose, { marginBottom: px(75) }]}
                                onPress={() => {
                                    setContactsModalVisible(!contactsModalVisible);
                                    setImage(null);
                                }}
                            >
                                <Text style={styles.textStyle}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={contactModalVisible}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                        setContactModalVisible(!contactModalVisible);
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={[styles.modalView1, { paddingTop: 0, paddingBottom: 0, flexGrow: 1, marginTop: (350 - keyboardAvoidingPadding) }]}>
                            <View style={{}}>
                                <Image source={require("../../assets/personal-information.jpg")} style={{ width: px(150), height: px(150) }} />
                            </View>
                            <Input
                                leftElement={<MaterialCommunityIcons style={{ marginLeft: px(10) }}
                                    name="account"
                                    size={px(24)}
                                    color="#808080" />}
                                height={px(40)}
                                value={contactDetails.firstName}
                                borderRadius={px(24)}
                                onFocus={() => setKeyboardAvoidingPadding(170)}
                                onBlur={() => setKeyboardAvoidingPadding(0)}
                                _focus={{ style: { backgroundColor: "#F8F8F8" } }}
                                placeholder="First name"
                                onChangeText={value => setContactDetails({
                                    ...contactDetails,
                                    firstName: value
                                })}
                            />
                            {''}
                            <View style={{ marginTop: px(24) }} />
                            <Input
                                leftElement={<MaterialCommunityIcons style={{ marginLeft: px(10) }}
                                    name="account"
                                    size={px(24)}
                                    color="#808080" />}
                                height={px(40)}
                                value={contactDetails.lastName}
                                borderRadius={px(24)}
                                onFocus={() => setKeyboardAvoidingPadding(170)}
                                onBlur={() => setKeyboardAvoidingPadding(0)}
                                _focus={{ style: { backgroundColor: "#F8F8F8" } }}
                                placeholder="Last name"
                                onChangeText={value => setContactDetails({
                                    ...contactDetails,
                                    lastName: value
                                })} />
                            {''}
                            <View style={{ marginTop: px(24) }} />
                            <Input
                                leftElement={<MaterialCommunityIcons style={{ marginLeft: px(10) }}
                                    name="phone"
                                    size={px(24)}
                                    color="#808080" />}
                                height={px(40)}
                                onFocus={() => setKeyboardAvoidingPadding(170)}
                                onBlur={() => setKeyboardAvoidingPadding(0)}
                                value={contactDetails.phone}
                                keyboardType="numeric"
                                borderRadius={px(24)}
                                _focus={{ style: { backgroundColor: "#F8F8F8" } }}
                                placeholder="Phone number"
                                onChangeText={value => {
                                    setContactDetails({
                                        ...contactDetails,
                                        phone: value
                                    });
                                }} />
                            {errors.phone.length ? <FormControl.ErrorMessage>{errors.phone}</FormControl.ErrorMessage> : <></>}
                            <View style={{ marginTop: px(24) }} />
                            <View style={{ flexDirection: "row", justifyContent: "space-around", width: px(250), }}>
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={() => {
                                        const newContactId = Math.floor(Math.random() * 100 + Math.random() * 34 + Math.random() * 24);
                                        fetch(`${baseUrl}/user/editquickcontact`, {
                                            method: 'PUT',
                                            headers: {
                                                'Accept': 'application/json',
                                                'Content-Type': 'application/json',
                                                'x-access-token': `${concept.value.token}`
                                            },
                                            body: JSON.stringify({
                                                id: concept.value.id,
                                                contact: {
                                                    id: contactDetails.id !== -1 ? contactDetails.id : newContactId,
                                                    firstname: contactDetails.firstName,
                                                    lastname: contactDetails.lastName,
                                                    phone: contactDetails.phone,
                                                    photo: contactDetails.photo,
                                                },
                                                type: contactDetails.type
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
                                            setContactDetailsSnapshot({
                                                id: contactDetails.id !== -1 ? contactDetails.id : newContactId,
                                                firstName: contactDetails.firstName,
                                                lastName: contactDetails.lastName,
                                                phone: contactDetails.phone,
                                                photo: contactDetails.photo,
                                                type: contactDetails.type
                                            })
                                            concept.setValue({...res, token: concept.value.token});
                                        })
                                            .catch(e => {
                                                Alert.alert("Internal server error!");
                                            })
                                        setContactModalVisible(!contactModalVisible);
                                    }}
                                >
                                    <Text style={styles.textStyle}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={() => {
                                        setContactDetails(contactDetailsSnapshot);
                                        setContactModalVisible(!contactModalVisible);
                                    }}
                                >
                                    <Text style={styles.textStyle}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScrollView>
    </View>
}

function ContactComponent({ type, contactsArray, setContactDetails, setContactDetailsSnapshot, setContactsModalVisible, setContactModalVisible }: {
    type: string,
    contactsArray: Contact[], setContactDetails: (contactDetails: { type: string, photo: string, firstName: string, lastName: string, phone: string, id: number }) => void,
    setContactDetailsSnapshot: (contactDetailsSnapshot: any) => void,
    setContactsModalVisible: (contactsVisibleModal: boolean) => void,
    setContactModalVisible: (contactVisibleModal: boolean) => void
}
) {

    return <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }}>
        {(contactsArray ?? []).map((contact, idx) => {
            return <TouchableOpacity key={idx} onPress={() => {
                if (type === "quick") {
                    const callDetails = {
                        number: contact.phone,
                        prompt: true,
                        skipCanOpen: true
                    }
                    call(callDetails).catch(console.error)
                }
            }} onLongPress={() => {
                setContactDetails({ type: type, photo: contact.photo, firstName: contact.firstname, lastName: contact.lastname, phone: contact.phone, id: contact.id })
                setContactsModalVisible(true);
                setContactDetailsSnapshot({ type: type, photo: contact.photo, firstName: contact.firstname, lastName: contact.lastname, phone: contact.phone, id: contact.id })
            }} style={{ backgroundColor: "#f6f6f6", marginLeft: px(12), marginTop: px(12), borderRadius: px(12), borderWidth: px(0.5), borderColor: 'black', width: px(160), height: px(160), justifyContent: 'center', alignItems: 'center' }}>
                {contact.photo ?
                    <Image source={{ uri: baseUrl + "/contact-photos/" + contact.photo }} style={{ opacity: type === "quick" ? 1 : 0.4, marginTop: px(12), width: px(65), height: px(65), borderRadius: px(35), borderWidth: 2, borderColor: "#FF7276" }} />
                    :
                    <View style={{ marginTop: px(12), width: px(65), height: px(65), borderRadius: px(35), borderWidth: 2, borderColor: "#FF7276" }}></View>
                }
                <Text style={{ marginTop: px(8), color: "#808080" }}>{contact.firstname} {contact.lastname}</Text>
                <Text style={{ marginTop: px(8), color: "#808080" }}>{contact.phone}</Text>
            </TouchableOpacity>
        })}
        <TouchableOpacity onPress={() => {
            setContactDetails({ type: type, firstName: "", lastName: "", phone: "", id: -1, photo: "" });
            setContactDetailsSnapshot({ type: type, firstName: "", lastName: "", phone: "", id: -1, photo: "" })
            setContactModalVisible(true);
        }} style={{ backgroundColor: "#f6f6f6", marginLeft: px(12), marginTop: px(12), borderRadius: px(12), borderWidth: px(0.5), borderColor: 'black', width: px(160), height: px(160), justifyContent: 'center', alignItems: 'center', marginRight: px(12) }}>
            <FontAwesome name="plus" size={72} color="#ff7276" />
        </TouchableOpacity>
    </ScrollView>
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        marginTop: px(100),
        flexDirection: "column",
        backgroundColor: "white",
        borderRadius: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 5
    },
    modalView1: {
        marginTop: px(350),
        backgroundColor: "white",
        borderRadius: 20,
        padding: 100,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        borderRadius: 20,
        padding: 20,
        elevation: 2,
        width: px(100)
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#FF7276",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
});
