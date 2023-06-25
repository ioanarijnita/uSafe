import React, { useState } from "react";
import { FormControl, InputLabel, Select, MenuItem, CircularProgress, Box, Typography, Button } from "@mui/material";
import moment from "moment";
import Collapsible from "react-collapsible";
import { baseUrl } from "./services/config";
import { useEffect } from "react";
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Pin from "./pin.png";
import Logo from "./logo.png";
import ReactMapGL, { MapRef, Marker } from "react-map-gl";

export function Monitor(p: { user: { token: string, accountSid: string }, setUser: (user: { token: string, accountSid: string }) => void }) {
  const [originalNotifications, setOriginalNotifications] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [markers, setMarkers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [showAddress, setShowAddress] = useState<{
    id: number,
    address: string
  }[]>([]);
  const refMap = React.useRef<MapRef | null>(null);
  const [filterBy, setFilterBy] = useState<"SOS Alert" | "Crime report" | "All">("All");

  useEffect(() => {
    setFetching(true);
    const interval = setInterval(() => {
      fetch(`${baseUrl}/notifications/getnotifications`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': p.user.token
        },
      }).then((response) => {
        if (response.status === 403) {
          localStorage.removeItem("accountSid");
          p.setUser({ accountSid: "", token: "" });
          window.location.href = "/";
        }
        if (response.ok) {
          return response.json();
        }
      }).then(res => {
        setNotifications(res.notifications);
        setOriginalNotifications(res.notifications);
        console.log(res.notifications)
        setFetching(false);
      })
        .catch(e => {
          console.log("internal error")
        })
    }, 3000)
    return () => clearInterval(interval);
  }, [])

  const TriggerElement = <div style={{ marginTop: 84, marginLeft: 48, cursor: "pointer", display: "flex", alignItems: "center", }}>
    <p style={{ fontWeight: "600" }}>Quick contacts</p>
    <ArrowDropDownIcon style={{ marginLeft: 10 }} />
  </div>

  const TriggerElementRestricted = <div style={{ marginTop: 48, marginLeft: 48, cursor: "pointer", display: "flex", alignItems: "center" }}>
    <p style={{ fontWeight: "600" }}>Restricted contacts</p>
    <ArrowDropDownIcon style={{ marginLeft: 10 }} />
  </div>
  const { innerWidth: width, innerHeight: height } = window;

  const generateMessageText = (message: string) => {
    switch (message) {
      case "accident":
        return "I had an accident";
      case "injury":
        return "I had an injury"
      case "following":
        return "I am followed by someone";
      case "car accident":
        return "I was in a car accident, please help!";
      case "ambulance":
        return "I need an ambulance"
      case "i am pyhisically hurt":
        return "I am physically hurt, please help!"
      case "blood everywhere":
        return "There is blood everywhere, please help!"
      case "broken bones":
        return "I think there are broken bones involved, please help!"
      case "fire":
        return "There is a fire, please help!"
      case "hurry":
        return "I need help, please hurry!"
      case "police":
        return "I need the police to come, please help!"
      case "murder":
        return "I think there's been a murder, please help!"
      case "no breathing":
        return "Someone here is not breathing, please help!"
      default:
        return message;
    }
  }

  return <div style={{ display: "flex", flexDirection: "column", height: height, overflowY: "hidden" }}>
    <div style={{ display: "flex", flexDirection: "row", height: 72, justifyContent: "space-between", marginLeft: 12, marginRight: 12, backgroundColor: "#f1f1f1" }}>
      <img src={Logo} style={{ width: 100, height: 60, alignSelf: "center" }} />
      <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-filled-label">Type</InputLabel>
        <Select
          value={filterBy}
          onChange={(val) => {
            setFilterBy(val.target.value as "SOS Alert" | "Crime report");
            if (val.target.value === "All") {
              setNotifications(originalNotifications);
            } else {
              setNotifications(originalNotifications.filter(n => n.notificationtype === val.target.value))
            }
          }}
        >
          <MenuItem value={"All"}>All</MenuItem>
          <MenuItem value={"SOS Alert"}>SOS Alert</MenuItem>
          <MenuItem value={"Crime report"}>Crime</MenuItem>
        </Select>
      </FormControl>
    </div>
    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", }}>
      <ReactMapGL
        mapboxAccessToken={process.env.REACT_APP_MAPS_API_KEY}
        initialViewState={{
          longitude: 21.226788,
          latitude: 45.760696,
          zoom: 11
        }}
        style={{ width: "50%", height: height - 25, }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        ref={refMap}
      >
        {markers.map((n, i) => <Marker key={i} longitude={n.longitude} latitude={n.latitude} anchor="bottom" >
          <img src={Pin} style={{ width: 30, height: 30 }} />
        </Marker>)}
      </ReactMapGL>
      {fetching ? <div style={{ display: "flex", flexGrow: 1, justifyContent: "center", alignItems: "center" }}><CircularProgress /></div> :
        notifications.length ? <Box style={{ maxHeight: height - 25, overflow: "scroll", width: "50%", backgroundColor: "#f1f1f1" }}>
          {notifications.map((n: any, idx: number) => <Box boxShadow={10} key={idx} sx={{ display: "flex", flexDirection: "row", backgroundColor: "white", borderRadius: 8, alignItems: "center", margin: 3, paddingBottom: 6 }}>
            <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexGrow: 1, marginTop: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", flexGrow: 1 }}>
                  <div style={{}}>
                    {n.image ? <img src={`${baseUrl}/profile/${n.image}`} style={{ width: 72, height: 72, borderRadius: 36, alignSelf: "flex-start", marginTop: 24, }} /> :
                      <div style={{ width: 100, height: 100, borderRadius: 80, border: "1px solid gray", display: "flex", justifyContent: "center", marginTop: 24, alignItems: "center", }}>
                        <p style={{ fontWeight: "bold" }}>NO IMAGE</p>
                      </div>
                    }
                    <Typography variant="body2" color="text.secondary" fontWeight={600} style={{ marginTop: 10 }}>0737903025</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>{n.email}</Typography>
                  </div>
                  <div style={{ marginTop: 24 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>{n.firstname} {n.lastname}</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>{moment(n.birthdate).format("DD-MM-YYYY")}</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>{n.bloodtype}</Typography>
                  </div>
                  <div>
                    <div style={{ display: "flex", marginTop: 24, justifyContent: "center", alignItems: "center", height: 44, width: 44, borderRadius: 33, border: "3px solid lightgray" }}>
                      {n.gender === "F" ? <FemaleIcon style={{ height: 33, width: 33, color: "lightgray" }} /> :
                        <MaleIcon style={{ height: 33, width: 33, color: "lightgray" }} />}
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 170, marginTop: 24, marginBottom: 12 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>{n.notificationtype}</Typography>
                    </div>
                    {n.crimetype !== null && Array.isArray(n.crimetype) && <Typography fontWeight={600} variant="body2" color="text.secondary" style={{ width: 250 }}>
                      Crime type: {n.crimetype.join(", ")}
                    </Typography>}
                    <Typography fontWeight={600} variant="body2" color="text.secondary">
                      Longitude: {n.longitude}
                    </Typography>
                    <Typography fontWeight={600} variant="body2" color="text.secondary">
                      Latitude: {n.latitude}
                    </Typography>
                    {showAddress.filter(sa => sa.id === n.id)?.slice(-1).map(a => <Typography variant="body2" color="text.secondary" style={{ width: 250 }}>
                      Address: {a.address}
                    </Typography>)}
                  </div>
                </div>
              </div>
              <div style={{ width: "100%", borderRadius: 4, display: "flex", flexDirection: "column" }}>
                <Typography style={{ textAlign: "center", marginTop: 12, fontWeight: "600" }}>
                  Allergies
                </Typography>
                <hr style={{ width: "100%" }} />
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", flexGrow: 1, marginTop: 12 }}>
                  <Typography style={{ width: 100, fontWeight: "600" }}>Food</Typography>
                  <Typography style={{ width: 100, fontWeight: "600" }}>Medication</Typography>
                  <Typography style={{ width: 100, fontWeight: "600" }}>Other</Typography>
                </div>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", flexGrow: 1, marginTop: 12 }}>
                  <Typography style={{ width: 100, flexWrap: "wrap" }}>{n.allergies.food} Chocolate allergy</Typography>
                  <Typography style={{ width: 100, flexWrap: "wrap" }}>{n.allergies.medication} Penicillin allergy</Typography>
                  <Typography style={{ width: 100, flexWrap: "wrap" }}>{n.allergies.other} NO</Typography>
                </div>
                <hr style={{ width: "100%" }} />
                <div style={{ marginLeft: 48, marginTop: 12 }}>
                  {n.definedmessage && !!n.definedmessage.length && <span style={{ fontWeight: "600" }}>Messages: </span>}
                  {n.definedmessage && !!n.definedmessage.length && n.definedmessage.map((m: any) => <p>
                    {generateMessageText(m)}
                  </p>)}
                </div>
                <Button onClick={() => {
                  setShowAddress([...showAddress, { id: n.id, address: n.address }])
                  refMap.current?.flyTo({ center: { lat: n.latitude, lon: n.longitude }, zoom: 15, animate: true })
                  if (!markers.map(m => m.index).includes(idx)) {
                    markers.push({ latitude: n.latitude, longitude: n.longitude, index: idx });
                    setMarkers([...markers]);
                  }
                }} size="large" variant="contained" style={{ width: "80%", alignSelf: "center", borderRadius: 8, marginTop: 24 }}>LOCATE</Button>
              </div>
              {n.contacts && !!n.contacts.length && <Collapsible open trigger={TriggerElement}>
                <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                  {n.contacts.map((contact: any) => <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: 12 }}>
                    <div style={{ marginLeft: 48, display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "600" }}>{contact.firstname}</span>
                      <span style={{ fontWeight: "600" }}>{contact.lastname}</span>
                      <span style={{ fontWeight: "600" }}>{contact.phone}</span>
                    </div>
                    <img src={`${baseUrl}/contact-photos/${contact.photo}`} style={{ width: 72, height: 72, borderRadius: 36, alignSelf: "flex-start", marginLeft: 12, marginTop: 12 }} />
                  </div>)}
                </div>
              </Collapsible>}
              {n.restrictedcontacts && !!n.restrictedcontacts.length && <Collapsible open trigger={TriggerElementRestricted}>
                <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                  {n.restrictedcontacts.map((contact: any) => <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: 12 }}>
                    <div style={{ marginLeft: 48, display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "600" }}>{contact.firstname}</span>
                      <span style={{ fontWeight: "600" }}>{contact.lastname}</span>
                      <span style={{ fontWeight: "600" }}>{contact.phone}</span>
                    </div>
                    <img src={`${baseUrl}/contact-photos/${contact.photo}`} style={{ width: 72, height: 72, borderRadius: 36, alignSelf: "flex-start", marginLeft: 12, marginTop: 12 }} />
                  </div>)}
                </div>
              </Collapsible>}
            </div>
          </Box>
          )}
        </Box> : <span>No SOS reports</span>}
    </div>
  </div>
}
