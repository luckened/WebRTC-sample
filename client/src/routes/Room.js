import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import User from "../components/user/user";
import './room.css'

const Room = (props) => {
    const userVideo = useRef();
    const partnerVideo = useRef();
    const peerRef = useRef();
    const socketRef = useRef();
    const otherUser = useRef();
    const userStream = useRef();
    const [usersList, setUsersList] = useState([]);
    const [nameInput, setNameInput] = useState("");
    const [showNameInput, setShowNameInput] = useState(false);
    const [showGuestVideo, setShowGuestVideo] = useState(false);

    const handleOkClick = () => {
        setUsersList((users) => users.concat(nameInput));
        setShowNameInput(false);
        setShowGuestVideo(true);
    };

    useEffect(() => {
        const myVideo = document.getElementById("myVideo");
        myVideo.muted = true;

        navigator.mediaDevices
            .getUserMedia({ audio: true, video: true })
            .then((stream) => {
                userVideo.current.srcObject = stream;
                userStream.current = stream;
                myVideo.muted = true;

                socketRef.current = io.connect("/");
                socketRef.current.emit("join room", props.match.params.roomID);

                socketRef.current.on("other user", (userID) => {
                    callUser(userID);
                    otherUser.current = userID;
                });

                socketRef.current.on("user joined", (userID) => {
                    otherUser.current = userID;
                    console.log("user joined", otherUser.current);
                    setShowNameInput(true);
                });

                socketRef.current.on("offer", handleRecieveCall);

                socketRef.current.on("answer", handleAnswer);

                socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
            });
    }, []);

    function callUser(userID) {
        peerRef.current = createPeer(userID);
        userStream.current
            .getTracks()
            .forEach((track) =>
                peerRef.current.addTrack(track, userStream.current)
            );
    }

    function createPeer(userID) {
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org",
                },
                {
                    urls: "turn:numb.viagenie.ca",
                    credential: "muazkh",
                    username: "webrtc@live.com",
                },
            ],
        });

        peer.onicecandidate = handleICECandidateEvent;
        peer.ontrack = handleTrackEvent;
        peer.onnegotiationneeded = () =>
            handleNegotiationNeededEvent(userID)
                .then((err) => console.log("negotiation then", err))
                .catch((err) => console.log("negotiation err", err));

        return peer;
    }

    function handleNegotiationNeededEvent(userID) {
        peerRef.current
            .createOffer()
            .then((offer) => {
                console.log("offer", offer);
                return peerRef.current.setLocalDescription(offer);
            })
            .then(() => {
                const payload = {
                    target: userID,
                    caller: socketRef.current.id,
                    sdp: peerRef.current.localDescription,
                };
                socketRef.current.emit("offer", payload);
            })
            .catch((e) => console.log("err", e));
    }

    function handleRecieveCall(incoming) {
        peerRef.current = createPeer();
        const desc = new RTCSessionDescription(incoming.sdp);
        peerRef.current
            .setRemoteDescription(desc)
            .then(() => {
                userStream.current
                    .getTracks()
                    .forEach((track) =>
                        peerRef.current.addTrack(track, userStream.current)
                    );
            })
            .then(() => {
                return peerRef.current.createAnswer();
            })
            .then((answer) => {
                return peerRef.current.setLocalDescription(answer);
            })
            .then(() => {
                const payload = {
                    target: incoming.caller,
                    caller: socketRef.current.id,
                    sdp: peerRef.current.localDescription,
                };
                socketRef.current.emit("answer", payload);
            });
    }

    function handleAnswer(message) {
        console.log("handleANs");
        console.log(message);
        const desc = new RTCSessionDescription(message.sdp);
        peerRef.current.setRemoteDescription(desc).catch((e) => console.log(e));
    }

    function handleICECandidateEvent(e) {
        if (e.candidate) {
            const payload = {
                target: otherUser.current,
                candidate: e.candidate,
            };
            socketRef.current.emit("ice-candidate", payload);
        }
    }

    function handleNewICECandidateMsg(incoming) {
        const candidate = new RTCIceCandidate(incoming);

        peerRef.current.addIceCandidate(candidate).catch((e) => console.log(e));
    }

    function handleTrackEvent(e) {
        partnerVideo.current.srcObject = e.streams[0];
    }

    return (
        <div className="room">
            <section className="videos">
                <video
                    id="myVideo"
                    className="myVideo"
                    autoPlay
                    ref={userVideo}
                />
                <video
                    className={showGuestVideo ? "myVideo" : "hideMyVideo"}
                    autoPlay
                    ref={partnerVideo}
                />
                <p className="subTitle">Disney Meets Streaming Web RTC</p>
                <section className="inputName">
                    {showNameInput && (
                        <>
                            <p>New user are coming, set his name:</p>

                            <input
                                type="text"
                                value={nameInput}
                                onChange={(ev) => setNameInput(ev.target.value)}
                            />
                            <button className="insertUserButton" onClick={handleOkClick}>Insert user</button>
                        </>
                    )}
                </section>
            </section>
            <div>

                <section className="userList">
                    {usersList &&
                        usersList.map((user) => (
                            <User >
                                {user}
                            </User>
                        ))}
                </section>
            </div>


            <button
                className="buttonGetMeetingLink"
                onClick={() => { navigator.clipboard.writeText(window.location.href) }}>
                Copy link
            </button>
        </div>
    );
};

export default Room;
