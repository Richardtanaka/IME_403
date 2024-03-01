try {
    // background.js  
    self.importScripts('firebase-app.js', 'firebase-auth.js', 'firebase-database.js', 'firebase-storage.js', 'firebase-storage.min.js');
    // Initialize Firebase
    const config = {
        apiKey: "AIzaSyA-pTXZYI4jHhhFVgTSnDd0MQxSD8OzYKE",
        authDomain: "conspire-7f980.firebaseapp.com",
        databaseURL: "https://conspire-7f980-default-rtdb.firebaseio.com",
        projectId: "conspire-7f980",
        storageBucket: "conspire-7f980.appspot.com",
        messagingSenderId: "102202895400",
        appId: "1:102202895400:web:05ec9a464f72bd7fc8d91d",
        measurementId: "G-0WY14X9T9Q"
    };
    firebase.initializeApp(config);
    // Listen for messages from script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        //NEW EVENTS
        if (request.action == "isUserLogin") {
            chrome.storage.local.get('signed_in', (data) => {
                sendResponse(data.signed_in);
            });
            return true;
        }
        else if (request.action === "TrySignUp") {
            let sentData = request.data; try {
                firebase.auth().createUserWithEmailAndPassword(sentData.email, sentData.password)
                    .then((userCredential) => {
                        sentData.uid = userCredential.user.uid;
                        firebase.database().ref(`/users/${sentData.uid}`)
                            .set(sentData).then(() => {
                                // The write succeed... 
                                chrome.storage.local.set({ 'signed_in': sentData });
                                sendResponse(sentData);
                            }).catch((error) => {
                                sendResponse(null);
                                console.log(error);
                            });
                    }).catch(function (error) {
                        sendResponse(null);
                        console.log(error);
                    });
            }
            catch (error) {
                sendResponse(null);
                console.log(error);
            }
            return true;
        }
        else if (request.action == "TryLogin") {
            try {
                let sentData = request.data;
                firebase.auth().signInWithEmailAndPassword(sentData.email, sentData.password)
                    .then((userCredential) => {
                        firebase.database().ref('/users/' + userCredential.user.uid).once('value')
                            .then((snapshot) => {
                                if (snapshot.val()) {
                                    let userRecord = snapshot.val();
                                    chrome.storage.local.set({ 'signed_in': userRecord });
                                    sendResponse(userRecord);
                                } else {
                                    sendResponse(null);
                                }
                            }).catch((error) => {
                                sendResponse(null);
                                console.log(error);
                            });
                    }).catch(function (error) {
                        sendResponse(null);
                        console.log(error);
                    });
            }
            catch (error) {
                sendResponse(null);
                console.log(error);
            }
            return true;
        }
        else if (request.action === "PerformLogout") {
            firebase.auth().signOut().then(() => {
                chrome.storage.local.remove(['signed_in'], (data) => { });
            }).catch((error) => {
                chrome.storage.local.remove(['signed_in'], (data) => { });
                console.log(error);
            });
        }
        else if (request.action === "PerformCreateChat") {
            let chat_name = request.chat_name; let user = request.user;
            try {
                if (!chat_name) { showMessage("Pls enter chat room name", "error"); return; }
                let chat_id = chat_name.trim().toLowerCase().replace(" ", "___").replace("/", "__").replace("-", "_");
                firebase.database().ref('/chatroom/' + user.uid + "/" + chat_id)
                    .once('value').then((snapshot) => {
                        if (snapshot.val()) {
                            sendResponse(null);
                        } else {
                            //create room with info 
                            firebase.database().ref('/chatroom/' + user.uid + "/" + chat_id)
                                .set({ name: chat_name, id: chat_id, creator: user.name, creator_id: user.uid }).then(() => {
                                    // The write suceeded... 
                                    //add creator to join room
                                    let creatorModel = { status: "active", name: user.name, uid: user.uid, creator_id: user.uid };
                                    if (user.photo) creatorModel.photo = user.photo;
                                    firebase.database().ref('/chatroom/' + user.uid + "/" + chat_id + "/users/" + user.uid)
                                        .set(creatorModel).then(() => {
                                            // The write suceeded... update user's chat list
                                            firebase.database().ref('/users/' + user.uid + "/chatroom/" + chat_id)
                                                .set({ name: chat_name, creator: user.name, id: chat_id, creator_id: user.uid }).then(() => {
                                                    // The write suceeded... 
                                                    sendResponse({ name: chat_name, creator: user.name, id: chat_id, creator_id: user.uid });
                                                }).catch((error) => {
                                                    sendResponse(null);
                                                    console.log(error);
                                                });
                                        }).catch((error) => {
                                            sendResponse(null);
                                            console.log(error);
                                        });
                                }).catch((error) => {
                                    sendResponse(null);
                                    console.log(error);
                                });
                        }
                    }).catch((error) => {
                        sendResponse(null);
                        console.log(error);
                    });
            } catch (error) {
                sendResponse(null);
                console.log(error);
            }
            return true;
        }
        else if (request.action === "PerformJoinChat") { 
            let chat_id = request.chat_id; let user = request.user;
            let array = chat_id.trim().split("-");
            firebase.database().ref('/chatroom/' + array[1] + "/" + array[0] + "/users/" + user.uid)
                .once('value').then((snapshot) => {
                    if (snapshot.val()) {
                        let userChatInfo = snapshot.val();
                        if (userChatInfo.status == "active")
                        sendResponse(["You have already joined this chat room", "warning"]);
                        else if (userChatInfo.status == "blocked")
                        sendResponse(["You have been blocked from this chat room", "error"]);
                        else if (userChatInfo.status == "rejected")
                        sendResponse(["You have already rejected this chat room", "error"]);
                        else if (userChatInfo.status == "invited") {
                            //update user to join room 
                            let invitedModel = { status: "active", name: user.name, uid: user.uid, creator_id: userChatInfo.uid };
                            if (user.photo) invitedModel.photo = user.photo;
                            firebase.database().ref('/chatroom/' + array[1] + "/" + array[0] + "/users/" + user.uid)
                                .set(invitedModel).then(() => {
                                    // The write suceeded... get chat info
                                    firebase.database().ref('/chatroom/' + array[1] + "/" + array[0])
                                        .once('value').then((snapshotChat) => {
                                            if (snapshotChat.val()) {
                                                let chatInfo = snapshotChat.val();
                                                let userRoomModel = { name: chatInfo.name, creator: chatInfo.creator, id: array[0], creator_id: chatInfo.creator_id };
                                                if (chatInfo.photo) userRoomModel.photo = chatInfo.photo;
                                                // The write suceeded... update user's chat list
                                                firebase.database().ref('/users/' + user.uid + "/chatroom/" + array[0])
                                                    .set(userRoomModel).then(() => {
                                                        // The write suceeded... 
                                                        sendResponse(["Congrat! You have joined this chat room successfully", "success"]);
                                                        chrome.runtime.sendMessage({ action: "PerformJoinChatSuccess", chat: chatInfo });
                                                    }).catch((error) => {
                                                        sendResponse(["Error Occurred updating user chatrooms", "error"]);
                                                        console.log(error);
                                                    });
                                            }
                                        }).catch((error) => {
                                            sendResponse(["Error Occurred getting chat info", "error"]);
                                            console.log(error);
                                        });
                                }).catch((error) => {
                                    sendResponse(["Error Occurred joining chatroom", "error"]);
                                    console.log(error);
                                });
                        }
                        else sendResponse(["Invalid status joining the chat room", "error"]);
                    } else {
                        sendResponse(["Sorry, you are not invited to this chat room.", "error"]);
                    }
                }).catch((error) => {
                    sendResponse(["Error Occurred finding chatroom", "error"]);
                    console.log(error);
                });
            return true;
        }
        else if (request.action === "MyChatList") {
            let userData = request.user;
            try {
                firebase.database().ref(`/users/${userData.uid}/chatroom/`).on('value', (myChatsListData) => {
                    let tempChatListData = [];
                    myChatsListData.forEach(chatSnap => { tempChatListData.push(chatSnap.val()); });
                    sendResponse(tempChatListData);
                });
            } catch (error) {
                sendResponse([]);
                console.log(error);
            }
            return true;
        }
        else if (request.action === "ObserveChat") {
            firebase.database().ref(`/chat/${request.chat_id}/`).on('value', (chatRoomMsgData) => {
                let tempChatRoomData = [];
                chatRoomMsgData.forEach(chatSnap => { tempChatRoomData.push(chatSnap); });
                sendResponse(tempChatRoomData);
            });
            return true;
        }
        else if (request.action === "sendChatDB") {
            chrome.storage.local.get('signed_in', (data) => {
                let userData = data.signed_in; let chatModel = request.chatModel; 
                chatModel.senderID = userData.uid; chatModel.sender = userData.name;
                if (userData.photo) chatModel.senderImage == userData.photo;
                firebase.database().ref(`/chat/${request.chat_id}/${chatModel.id}/`).set(chatModel).then(() => {
                    sendResponse(chatModel); 
                }).catch((error) => {
                    sendResponse(null); 
                    console.log(error);
                });
            });
            return true;
        }
        else if (request.action === "inviteUser") {
            let inviteEmail = request.inviteEmail;
            let user = request.user; let chat = request.chat;
            const usersRef = firebase.database().ref('/users');
            usersRef.once('value', (snapshot) => {
                const users = snapshot.val(); let userFound = false;
                if (users) {
                    Object.keys(users).forEach(userKey => {
                        const emailUser = users[userKey];
                        if (emailUser.email === inviteEmail) {
                            userFound = true;  // Found the user by email 
                            firebase.database().ref('/chatroom/' + user.uid + "/" + chat.id + "/users/" + emailUser.uid)
                                .once('value').then((snapshot) => {
                                    if (snapshot.val()) {
                                        let userChatInfo = snapshot.val();
                                        if (userChatInfo.status == "active")
                                            sendResponse("User already joined this chat room");
                                        else if (userChatInfo.status == "blocked")
                                            sendResponse("You have blocked the user from this chat room");
                                        else if (userChatInfo.status == "rejected")
                                            sendResponse("User already rejected this chat room");
                                        else if (userChatInfo.status == "invited")
                                            sendResponse("You have already invited this chat room");
                                        else sendResponse("Invalid status joining the chat room");
                                    } else {
                                        // Invite the emailUser by email 
                                        let invitModel = { status: "invited", name: emailUser.name, uid: emailUser.uid, creator_id: user.uid };
                                        if (emailUser.photo) invitModel.photo = emailUser.photo;
                                        firebase.database().ref('/chatroom/' + user.uid + "/" + chat.id + "/users/" + emailUser.uid)
                                            .set(invitModel).then(() => {
                                                // The write suceeded... update emailUser's chat list
                                                sendResponse("Congrat! You have invited the user to this chat room successfully", "success");
                                            }).catch((error) => {
                                                sendResponse("Error Occurred inviting user");
                                                console.log(error);
                                            });
                                    }
                                }).catch((error) => {
                                    sendResponse("Error Occurred determining user status");
                                    console.log(error);
                                });
                        }
                    });
                }
                if (!userFound) sendResponse('User not found');
            });
            return true;
        }
        else if (request.action === "sentToFirebaseStorage") {
            sentToFirebaseStorage(request.imageData, request.userData);
        }  
        else if (request.action === "signInWithGoogle") {
            
        } 
    }); 
    function sentToFirebaseStorage(imageData, userData) {
        const blob = dataURLtoBlob(imageData);
        var storageRef = firebase.storage().ref(); const fileName = `image_${new Date().getTime()}.png`;
        var uploadTask = storageRef.child("/ProfilePics/" + userData.uid + "/" + fileName).put(blob);
        // Register three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion
        uploadTask.on('state_changed',
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                // Handle unsuccessful uploads
            },
            () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    userData.photo = downloadURL; chrome.storage.local.set({ 'signed_in': userData });
                    UpdateFirebaseUserInfo(userData); showMessage("Photo updated successfully", "success", true);
                });
            }
        );

        // const storage = firebase.storage(); console.log(userData);
        // const storageRef = storage.ref("/ProfilePics/" + userData.uid + "/" + fileName);
        // const blob = dataURLtoBlob(imageData);
        // const uploadTask = storageRef.put(blob);
        // uploadTask.on('state_changed', (snapshot) => {
        //     // const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100; 
        // },
        //     (error) => {
        //         showMessage('Error uploading image:', "error");
        //         console.log('Error uploading image:', error);
        //     },
        //     () => {
        //         uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        //             console.log("upload storage");
        //             userData.photo = downloadURL; chrome.storage.local.set({ 'signed_in': userData });
        //             UpdateFirebaseUserInfo(userData); showMessage("Photo updated successfully", "success", true);
        //         });
        //     }
        // );

    }
    function dataURLtoBlob(dataURL) {
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    } 
} catch (error) {
    console.log(error);
}