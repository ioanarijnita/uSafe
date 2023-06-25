import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Routes, Route } from 'react-router-dom';
import { Monitor } from './monitor';
import { LoginPage } from './login';
import { VerifyCode } from './verify-code';
import { useState } from 'react';

function App() {
  const [user, setUser] = useState({
    accountSid: "",
    token: ""
  });

  if (window.performance) {
    if (performance.navigation.type == 1) {
      window.location.href = "/";
      localStorage.removeItem("accountSid");
    }
  }

  return (
    user.accountSid ?
      <Routes>
        <Route path="/home" element={<Monitor user={user} setUser={setUser} />} />
      </Routes> :
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/verify-code" element={<VerifyCode setUser={setUser} />} />
      </Routes>
  )
}

export default App;
