// Firebase config
var firebaseConfig = {
  apiKey: "AIzaSyDbA-xi8tM5Zvyxn-S1fqDj2gy3CXZi-04",
  authDomain: "test-41d64.firebaseapp.com",
  databaseURL: "https://test-41d64-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "test-41d64",
  storageBucket: "test-41d64.appspot.com",
  messagingSenderId: "255764597948",
  appId: "1:255764597948:web:eedcc54ab6703d497954b9",
  measurementId: "G-VQT3ZHCX9R"
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.database();

let currentPen = "chuongcuu";

// =========== Clock ============
function updateClock(){
  document.getElementById("clock").innerText = new Date().toLocaleTimeString();
}
setInterval(updateClock,1000); updateClock();

// =========== Chart.js setup ============
const barChart = new Chart(document.getElementById("barChart"), {
  type:"bar",
  data:{ labels:[], datasets:[{ label:"Gas", data:[], backgroundColor:"#3e95cd" }] },
  options:{ responsive:true, maintainAspectRatio:false }
});
const lineChart = new Chart(document.getElementById("lineChart"), {
  type:"line",
  data:{ labels:[], datasets:[{ label:"Temperature (°C)", data:[], fill:false }] },
  options:{ responsive:true, maintainAspectRatio:false }
});
const pieChart = new Chart(document.getElementById("pieChart"), {
  type:"pie",
  data:{ labels:["CO₂","Temp","Humidity"], datasets:[{ data:[0,0,0] }] },
  options:{ responsive:true, maintainAspectRatio:false }
});
const MAX_POINTS = 20;
function pushData(chart,label,val){
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(val);
  if(chart.data.labels.length>MAX_POINTS){ chart.data.labels.shift(); chart.data.datasets[0].data.shift(); }
  chart.update();
}

// =========== Firebase listeners ============
function listenSensor(key,cb){ db.ref(`/${currentPen}/${key}`).on("value", snap=>cb(snap.val())); }

listenSensor("gas", val=>{
  document.getElementById("gas").textContent = val ?? "--";
  pushData(barChart, new Date().toLocaleTimeString(), val);
  pieChart.data.datasets[0].data[0]=val; pieChart.update();
});
listenSensor("temperature", val=>{
  document.getElementById("temperature").textContent = val ?? "--";
  pushData(lineChart, new Date().toLocaleTimeString(), val);
  pieChart.data.datasets[0].data[1]=val; pieChart.update();
});
listenSensor("humidity", val=>{
  document.getElementById("humidity").textContent = val ?? "--";
  pieChart.data.datasets[0].data[2]=val; pieChart.update();
});

// Device icon map
const mapIcon = {
  light:{on:"den1.gif",off:"den.png",id:"imgLight"},
  door:{on:"door1.gif",off:"door.png",id:"imgDoor"},
  music:{on:"nhac1.gif",off:"nhac.png",id:"imgMusic"}
};
["light","door","music"].forEach(device=>{
  listenSensor(device, val=>{
    const cfg = mapIcon[device];
    document.getElementById(cfg.id).src = (val===1)?cfg.on:cfg.off;
  });
});

function toggleDevice(device,isOn){
  db.ref(`/${currentPen}/${device}`).set(isOn?1:0);
  if (device === "music") {
    const audio = document.querySelector("audio");
    if (audio) {
      if (isOn) audio.play();
      else audio.pause();
    }
  }
}
