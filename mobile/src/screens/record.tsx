import { useNavigation } from '@react-navigation/native';
import { Camera, CameraType } from 'expo-camera';
import { useState, useEffect, useRef, useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Modal, Pressable, Dimensions } from 'react-native';
import { baseUrl } from '../services/config';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';
import { px } from '../hooks/utils';
import Toast from 'react-native-root-toast';
import { LoginContext, initialConceptData } from './common/login';
import { LocationContext } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const height = Dimensions.get('window').height;

export function Record() {
    const [type, setType] = useState(CameraType.front);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [cam, setCam] = useState<Camera | null>(null);
    const [recordStarted, setRecordStarted] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const nav = useNavigation();
    const concept = useContext(LoginContext);
    const location = useContext(LocationContext);

    const discarded = useRef(false);

    useEffect(() => {
        (async () => {
            const statusCamera = await Camera.requestCameraPermissionsAsync();
            const statusMic = await Camera.requestMicrophonePermissionsAsync();
        })();
    }, []);

    function toggleCameraType() {
        setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    }

    const record = async () => {
        setRecordStarted(true);
        if (cam && !recordStarted) {
            try {
                const sola = await cam.recordAsync({quality: "4:3" });
                setRecordStarted(false);
                if (discarded.current) return;
                const body = new FormData();
                body.append('file', {
                    uri: sola.uri,
                    type: "video/mp4",
                    name: sola.uri.split("/").pop()
                } as any);
                axios({
                    method: "post",
                    url: `${baseUrl}/user/video`,
                    data: body,
                    headers: { 
                        "Content-Type": "multipart/form-data",
                        'x-access-token': `${concept.value.token}`
                     },
                })
                    .then((result) => {
                        if (result.status === 403) {
                            AsyncStorage.removeItem("userPayload");
                            concept.setValue(initialConceptData);
                            throw new Error("Error video upload");
                        }
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
                                definedmessage: result.data.message,
                                notificationtype: "SOS Alert",
                                notificationid: notifId
                            })
                        }).then(res => {
                            if (res.status === 403) {
                                AsyncStorage.removeItem("userPayload");
                                concept.setValue(initialConceptData);
                                throw new Error("Error sending notification");
                            }
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
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            } catch (e) {
                console.log("error", e)
            }
        } else if (recordStarted && cam) {
            await stopRecording(true);
        }
    }

    const stopRecording = async (success: boolean) => {
        if (cam) {
            try {
                if (!success) {
                    setModalVisible(false);
                    discarded.current = true;
                    nav.navigate("Assistance" as never);
                } else {
                    await cam.stopRecording();
                    nav.navigate("Assistance" as never);
                    Toast.show("Your assistance request has been sent.", {
                        duration: Toast.durations.LONG,
                        position: Toast.positions.BOTTOM - 50,
                        shadow: true,
                        animation: true,
                        hideOnPress: true,
                        delay: 0,
                        containerStyle: { borderRadius: 16, width: "90%" }
                    });
                }
            } catch (e) {
                console.log("error", e)
            }
        }
    }

    const discardRecord = () => {
        if (recordStarted) {
            setModalVisible(true);
        } else {
            nav.navigate("Assistance" as never);
        }
    }

    return <View style={{ flex: 1 }}>
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
            }}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={{ margin: 24 }}>
                        <Text style={styles.modalText}>Are you sure you want to discard your recording?</Text>
                        <View style={{ justifyContent: "space-between", flexDirection: "row", marginTop: 20 }}>
                            <Pressable
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => stopRecording(false)}>
                                <Text style={styles.textStyle}>YES</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => setModalVisible(!modalVisible)}>
                                <Text style={styles.textStyle}>NO</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
        <Camera style={{ flex: 1 }} type={type} ref={(ref) => setCam(ref)}>
            <View style={{ flexGrow: 1 }} />
            <View style={{ justifyContent: "space-around", flexDirection: "row", backgroundColor: "black", paddingVertical: px(40) }}>
                {!recordStarted ? <TouchableOpacity style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 1, borderColor: "white", justifyContent: "center", alignItems: "center" }} onPress={toggleCameraType}>
                    <MaterialIcons name="repeat" size={36} color="white" />
                </TouchableOpacity> : <TouchableOpacity style={{ width: 72, height: 72 }} />}
                <TouchableOpacity style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 1, borderColor: "white", justifyContent: "center", alignItems: "center", backgroundColor: recordStarted ? "red" : "transparent" }} onPress={record}>
                    <View style={{ padding: 16, borderRadius: !recordStarted ? 16 : 10, backgroundColor: "white" }}></View>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 1, borderColor: "white", justifyContent: "center", alignItems: "center" }} onPress={discardRecord}>
                    <Foundation name="x" size={36} color="white" />
                </TouchableOpacity>
            </View>
        </Camera>
    </View>
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        marginTop: (height / 2) - 200,
        alignItems: 'center',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        justifyContent: "center",
        height: 200,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 4,
        paddingVertical: 18,
        paddingHorizontal: 24,
        marginHorizontal: 16,
        elevation: 2,
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    buttonClose: {
        backgroundColor: '#FF6D6A',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    modalText: {
        marginBottom: 15,
        fontSize: 18,
        textAlign: 'center',
        fontWeight: "600"
    },
});
