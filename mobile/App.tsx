import { NavigationContainer } from "@react-navigation/native";
import MapboxGL from "@rnmapbox/maps";
import { NativeBaseProvider } from "native-base";
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignUpNavigator } from "./src/navigators/signup-navigator";
import { Concept, LoginContext } from "./src/screens/common/login";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Geolocation from "@react-native-community/geolocation";
import Geocoder from "react-native-geocoding";
import { Alert } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { RootSiblingParent } from "react-native-root-siblings";
import { baseUrl } from "./src/services/config";
import { MAPBOX_ACCESS_TOKEN, GEOCODE_ACCESS_KEY } from "@env";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [proofOfConceptData, setProofOfConceptData] = useState<Concept>({
    id: "",
    token: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    birthDate: "",
    bloodType: "",
    progress: 0,
    gender: "",
    image: "",
    contacts: [],
    allergies: {
      food: "",
      medication: "",
      other: "",
    },
    restrictedContacts: [],
  });
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
    address: "",
  });

  useEffect(() => {
    MapboxGL.setWellKnownTileServer("mapbox");
    MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);
    Geocoder.init(GEOCODE_ACCESS_KEY);
    // MapboxGL.setConnected(true);
    Geolocation.getCurrentPosition((info) => {
      Geocoder.from(info.coords.latitude, info.coords.longitude)
        .then((json) => {
          const addressComponent = json.results[0].formatted_address;
          setLocation({
            latitude: info.coords.latitude,
            longitude: info.coords.longitude,
            address: addressComponent,
          });
        })
        .catch((error) => console.warn(error));
    });
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        AsyncStorage.getItem("userPayload").then((r) => {
          if (r) {
            const foundUser = JSON.parse(r);
            setProofOfConceptData(foundUser);
            fetch(`${baseUrl}/user/getProfile`, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-access-token": `${foundUser.token}`,
              },
              body: JSON.stringify({
                phonenumber: foundUser.phoneNumber,
              }),
            })
              .then((response) => {
                if (response.ok) {
                  return response.json();
                }
              })
              .then((res) => {
                if (res) {
                  setProofOfConceptData({ ...foundUser, ...res });
                  AsyncStorage.setItem(
                    "userPayload",
                    JSON.stringify({ ...foundUser, ...res })
                  );
                } else {
                  Alert.alert("Internal server error!!");
                }
              })
              .catch((e) => {
                Alert.alert("Internal server error!!!");
              });
          }
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <NativeBaseProvider>
      <SafeAreaView onLayout={onLayoutRootView} style={{ flex: 1 }}>
        <LoginContext.Provider
          value={{ value: proofOfConceptData, setValue: setProofOfConceptData }}
        >
          <LocationContext.Provider
            value={{ value: location, setValue: setLocation }}
          >
            <RootSiblingParent>
              <NavigationContainer>
                <SignUpNavigator />
              </NavigationContainer>
            </RootSiblingParent>
          </LocationContext.Provider>
        </LoginContext.Provider>
      </SafeAreaView>
    </NativeBaseProvider>
  );
}

export const LocationContext = React.createContext<{
  value: { latitude: number; longitude: number; address: string };
  setValue: (value: {
    latitude: number;
    address: string;
    longitude: number;
  }) => void;
}>({
  value: {
    latitude: 0,
    longitude: 0,
    address: "",
  },
  setValue: () => {},
});
