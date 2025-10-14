import { useState } from 'react';
import './App.css';
import Base64 from './base_64.js';

const API_BASE = "http://localhost:8080"; // 🔥 измени на свой backend порт

function App() {
  const [token, setToken] = useState(null);

const request = (url, conf) => new Promise((resolve, reject) => {
  if (url.startsWith('/')) url = API_BASE + url;

  console.log("➡️ Fetching URL:", url);
  console.log("⚙️ Config:", conf);

  fetch(url, conf)
    .then(async r => {
      console.log("⬅️ Response status:", r.status);
      const type = r.headers.get("content-type") || "";
      
      if (!r.ok) {
        const text = await r.text();
        console.error("❌ Server returned error:", r.status, text);
        throw new Error("Server error: " + r.status + " " + text);
      }

      if (!type.includes("application/json")) {
        const text = await r.text();
        console.error("❌ Unexpected content-type:", type, "Body:", text);
        throw new Error("Expected JSON, got: " + text.slice(0, 100));
      }

      return r.json();
    })
    .then(j => {
      if (j.status?.isSuccess) resolve(j.data);
      else {
        console.warn("⚠️ API returned failure:", j);
        reject(j);
      }
    })
    .catch(err => {
      if (err instanceof TypeError) {
        console.error("💥 Network / CORS error:", err.message);
      } else {
        console.error("❌ Fetch failed:", err);
      }
      reject(err);
    });
});

  return token == null 
    ? <GuestMode request={request} setToken={setToken} /> 
    : <AuthMode request={request} />;
}

function AuthMode({request}) {  
  const [txt, setTxt] = useState("");
  const [data, setData] = useState({
    name: "",
    email: "",
    birthdate: "",
    login: "",
    password: "",
    repeat: ""
  });

  const testGet = () => request("/api/client/login").then(setTxt);
  const testPut = () => request("/api/client", { method: 'PUT' }).then(setTxt);

  const testPost = () => {
    request("/api/client", {
      method: "POST",
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(data)
    })
    .then(j => setTxt(JSON.stringify(j)));
  };

  const install = () => {
    request("/api/client/install")
    .then(j => setTxt(JSON.stringify(j)));
  };

  return <>
    <h1>Випробування API</h1>
    <button onClick={testGet}>GET</button>
    <button onClick={testPut}>PUT</button>
    <button onClick={install}>INSTALL</button>
    <div style={{border: "1px solid lightgray", margin: "10px 0", padding: "5px"}}>
      <input type="text" value={data.name} onChange={e => setData({...data, name: e.target.value})}/> <br/>
      <input type="email" value={data.email} onChange={e => setData({...data, email: e.target.value})}/> <br/>
      <input type="date" value={data.birthdate} onChange={e => setData({...data, birthdate: e.target.value})}/> <br/>
      <input type="text" value={data.login} onChange={e => setData({...data, login: e.target.value})}/> <br/>
      <input type="password" value={data.password} onChange={e => setData({...data, password: e.target.value})}/> <br/>
      <input type="password" value={data.repeat} onChange={e => setData({...data, repeat: e.target.value})}/> <br/>
      <button onClick={testPost}>Реєстрація</button>
    </div>
    <p>{txt}</p>
  </>;
}

function GuestMode({request, setToken}) {  
  const [auth, setAuth] = useState({ login: "", password: "" });

  const onAuthClick = () => {
    const credentials = Base64.encode(auth.login + ':' + auth.password);
    request("/api/client/auth", {
      method: "GET",
      headers: { "Authorization": 'Basic ' + credentials }
    })
    .then(setToken)
    .catch(console.error);
  };

  return <>
    <div style={{border: "1px solid lightgray", margin: "10px 0", padding: "5px"}}>
      <h2>Автентифікація</h2>
      <input type="text" value={auth.login} onChange={e => setAuth({...auth, login: e.target.value})}/> <br/>
      <input type="password" value={auth.password} onChange={e => setAuth({...auth, password: e.target.value})}/> <br/>
      <button onClick={onAuthClick}>Вхід</button>
    </div>
  </>;
}

export default App;
