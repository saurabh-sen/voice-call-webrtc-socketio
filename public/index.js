import { stun_servers } from "./constants.js";
const socket = io();

const accountIdEl = document.getElementById("accountId");

const callingEl = document.getElementById("calling");
callingEl.textContent = "Calling...";
callingEl.style.display = "none";
const ringingEl = document.getElementById("ringing");
ringingEl.textContent = "Ringing...";
ringingEl.style.display = "none";

const remoteAudioEl = document.getElementById("remoteAudioStreamDivId");
const localAudioEl = document.getElementById("localAudioStreamDivId");

const remoteSocketIdEl = document.getElementById("remoteId");
const startCallEl = document.getElementById("localAudioInitButtonId");
const acceptCallEl = document.getElementById("localAudioAcceptButtonId");

//peers
let localPeerConnection;
let remotePeerConnection;
const configuration = {
  iceServers: stun_servers,
  iceCandidatePoolSize: 10,
};
const constraints = { video: false, audio: true };

socket.on("connect", () => {
  accountIdEl.textContent = socket.id;
});

startCallEl.addEventListener("click", async () => {
  // if (remoteSocketIdEl.value === "") return;
  try {
    let streams = await window.navigator.mediaDevices.getUserMedia(constraints);
    console.log("caller audio stream", streams.getTracks());
    localPeerConnection = new RTCPeerConnection(configuration);
    callingEl.style.display = "block";
    localAudioEl.srcObject = streams;
    localAudioEl.autoplay = true;
    streams.getTracks().forEach((track) => {
      localPeerConnection.addTrack(track, streams);
    });
    let sdpOffer = await localPeerConnection.createOffer();
    await localPeerConnection.setLocalDescription(
      new RTCSessionDescription(sdpOffer)
    );
    socket.emit("offer", sdpOffer);

    localPeerConnection.ontrack = (e) => {
      console.log("caller", e);
      remoteAudioEl.srcObject = e.streams[0];
      remoteAudioEl.play();
      callingEl.style.display = "none";
    };

    localPeerConnection.onicecandidate = ({ candidate }) => {
      // console.log("l-candidate", candidate);
      socket.emit("lcandidate", candidate);
      // socket.emit("candidate", candidate);
    };

    localPeerConnection.addEventListener("iceconnectionstatechange", () => {
      if (localPeerConnection.iceConnectionState === "connected") {
        console.log("sucessfully connected");
      }
    });
  } catch (err) {
    console.log(err);
  }
});

socket.on("answer", async (answer) => {
  console.log("answer from remote", answer);
  await localPeerConnection.setRemoteDescription(
    new RTCSessionDescription(answer)
  );
});

socket.on("offer", (sdpOffer) => {
  ringingEl.style.display = "block";
  acceptCallEl.addEventListener("click", async () => {
    try {
      remotePeerConnection = new RTCPeerConnection(configuration);
      let streams = await window.navigator.mediaDevices.getUserMedia(
        constraints
      );
      console.log("answer audio streams", streams.getTracks());
      remoteAudioEl.srcObject = streams;
      remoteAudioEl.autoplay = true;

      streams.getTracks().forEach((track) => {
        remotePeerConnection.addTrack(track, streams);
      });

      remotePeerConnection.ontrack = function (e) {
        console.log("answerer", e);
        ringingEl.style.display = "none";
        localAudioEl.srcObject = e.streams[0];
        localAudioEl.autoplay = true;
      };
      remotePeerConnection.onicecandidate = ({ candidate }) => {
        // console.log("r-candidate", candidate);
        socket.emit("rcandidate", candidate);
        // socket.emit("candidate", candidate);
      };

      await remotePeerConnection.setRemoteDescription(
        new RTCSessionDescription(sdpOffer)
      );

      remotePeerConnection.addEventListener("iceconnectionstatechange", () => {
        if (remotePeerConnection.iceConnectionState === "connected") {
          console.log("sucessfully connected");
        }
      });

      console.log("remotePeerConnection", remotePeerConnection.iceConnectionState)

      if (
        remotePeerConnection.remoteDescription.type === "offer" &&
        remotePeerConnection.iceConnectionState === "new"
      ) {
        let answer = await remotePeerConnection.createAnswer();
        await remotePeerConnection.setLocalDescription(
          new RTCSessionDescription(answer)
        );
        socket.emit("answer", answer);
      }

      // socket.emit("answer", answer);
    } catch (err) {
      console.log(err);
    }
  });
});

socket.on("lcandidate", async (candidate) => {
  // console.log("l-candidate", candidate);
  remotePeerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
});
socket.on("rcandidate", async (candidate) => {
  console.log("r-candidate", candidate);
  localPeerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
});
// socket.on("candidate", async (candidate) => {
//   try {
//     let conn = localPeerConnection || remotePeerConnection;
//     await conn?.addIceCandidate(candidate);
//   } catch (err) {
//     console.log(err);
//   }
// });
