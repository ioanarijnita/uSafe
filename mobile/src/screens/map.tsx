import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapboxGL from "@rnmapbox/maps";
import React, { useContext } from "react";
import { View, Text, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { LocationContext } from "../../App";
import { px } from "../hooks/utils";
import { LoginContext } from "./common/login";
import { baseUrl } from "../services/config";

export function MapScreen() {
  const nav = useNavigation();
  const concept = useContext(LoginContext);
  const location = useContext(LocationContext);
  const route = useRoute();
  const coordinates = [location.value.longitude, location.value.latitude]
  const params = route.params as any;

  return <View style={{ marginLeft: px(12), marginRight: px(12), }}>
    <View style={{ height: px(90), flexDirection: "column", justifyContent: "center", backgroundColor: "#f2f2f2", marginTop: px(16), borderRadius: px(24), shadowColor: "black", shadowOffset: { height: 2, width: 2 }, shadowOpacity: 0.4 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "68 %" }}>
        <TouchableOpacity onPress={() => nav.navigate("Emergency" as never)} style={{ marginLeft: px(16) }}>
          <MaterialCommunityIcons name="arrow-left" size={px(28)} color="#808080" />
        </TouchableOpacity>
        <Text style={{ fontWeight: "600", fontSize: px(18), color: "#808080" }}>Emergency place</Text>
      </View>
    </View>
    {params && params.isAlert && 
    <>
    <Text style={{ marginTop: px(32), fontSize: px(20), color: "#FF7276", fontWeight: "600", textAlign: "center", shadowColor: "black", shadowOpacity: 0.3, shadowOffset: { width: 1, height: 1 } }}>Ambulance and response teams are on their way to you</Text>
    <Text style={{ marginTop: px(16), marginBottom: px(16), fontSize: px(16), color: "#808080", fontWeight: "400", shadowColor: "black", shadowOpacity: 0.3, shadowOffset: { width: 1, height: 1 }, textAlign: "center" }}>Try to reach the safest spot until we get to you</Text>
    </>}
    <View style={{ flex: 1 }}>
      <MapboxGL.MapView style={{ height: px(params && params.isAlert ? 335 : 450) }} zoomEnabled onPress={e => console.log(e)} >
        <MapboxGL.UserLocation
          visible={true}
          onUpdate={(location) => {  }}
          showsUserHeadingIndicator={true}
        />
        <MapboxGL.Camera centerCoordinate={coordinates} zoomLevel={12} />
      </MapboxGL.MapView>
    </View>
    <View style={{ height: px(130), flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#f2f2f2", marginTop: px(params && params.isAlert ? 324 : 450), borderRadius: px(24), shadowColor: "black", shadowOffset: { height: 2, width: 2 }, shadowOpacity: 0.4 }}>
      <View style={{ width: 350, flexDirection: "row", marginTop: px(10), marginLeft: px(10)}}>
        {concept.value.image ?
          <Image source={{ uri: baseUrl + "/profile/" + concept.value.image }} style={{width: px(60), height: px(60), borderRadius: px(30), borderWidth: 2, borderColor: "#FF7276" }} />
          :
          <View style={{ width: px(60), height: px(60), borderRadius: px(30), borderWidth: 2, borderColor: "#FF7276", marginRight: px(20) }}></View>
        }
        <View style={{ flexDirection: "column", marginLeft: px(20) }}>
          <Text style={{ fontSize: px(16), fontWeight: "600" }}>{concept.value.firstName} {concept.value.lastName}</Text>
          <Text numberOfLines={2} adjustsFontSizeToFit style={{ fontSize: px(12), color: "#808080", marginTop: px(8), maxWidth: px(250), maxHeight: px(30) }}>{location.value.address}
          </Text>
        </View>
      </View>
    </View>
  </View>
}
