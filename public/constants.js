const google_stun = "stun:stun.l.google.com:19302";
const google_stun1 = "stun:stun1.l.google.com:19302";
const google_stun2 = "stun:stun2.l.google.com:19302";
const google_stun3 = "stun:stun3.l.google.com:19302";
const google_stun4 = "stun:stun4.l.google.com:19302";
const stun_servers = [
  {
    url: "turn:numb.viagenie.ca",
    credential: "muazkh",
    username: "webrtc@live.com",
  },
  {
    urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
  },
];
const server_url = "http://localhost:8000/";
export { stun_servers, server_url };
