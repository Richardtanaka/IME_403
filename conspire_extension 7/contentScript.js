function showLoading(showLoad) {

}
function showMessage(msg, icon) {
  alert(msg);
}
const overlayDiv = document.createElement("div");
overlayDiv.id = "overlayDiv";
overlayDiv.style.position = "fixed";
overlayDiv.style.top = "300px";
overlayDiv.style.right = "0";
overlayDiv.style.width = "auto";
overlayDiv.style.display = "flex";
overlayDiv.style.flexDirection = "column";
overlayDiv.style.alignItems = "center";
overlayDiv.style.padding = "10px";
overlayDiv.style.backgroundColor = "#000";
overlayDiv.style.textAlign = "center";
overlayDiv.style.borderRadius = "10px";
overlayDiv.style.marginRight = "10px";
overlayDiv.style.pointerEvents = "auto";
const shareIcon = document.createElement("img");
shareIcon.src = "https://img.icons8.com/flat-round/64/share--v1.png";
const shareText = document.createElement("span");
shareText.textContent = "Share to Conspire";
shareText.style.color = "#25B7D3";
shareText.style.marginTop = "5px";
shareText.style.fontWeight = "bolder";
overlayDiv.appendChild(shareIcon);
overlayDiv.appendChild(shareText);
const getContentPopupView = async () => {
  try {
    overlayDiv.removeEventListener('click', getContentPopupView);
    const userLogin = await sendBGMessageAsync({ action: "isUserLogin" });
    if (userLogin) ShowDashboardView(userLogin); else ShowLoginView();
  } catch (error) {
    console.log(error);
  }
};
overlayDiv.addEventListener('click', getContentPopupView);
document.body.appendChild(overlayDiv);
//implementations
function OnBackClicked() {
  setTimeout(() => {
    overlayDiv.addEventListener('click', getContentPopupView);
  }, 500);
  overlayDiv.innerHTML = ""; overlayDiv.style.top = "300px";
  overlayDiv.style.backgroundColor = "#000";
  overlayDiv.appendChild(shareIcon); overlayDiv.appendChild(shareText);
}
const sendBGMessageAsync = (message) => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response);
    });
  });
};
//login main 
function ShowLoginView() {
  overlayDiv.style.top = "150px"; overlayDiv.innerHTML = "";
  overlayDiv.style.backgroundColor = "transparent";
  //injectHTML
  const cardContainer = document.createElement("div");
  // cardContainer.style.backgroundColor = "#FBFBFB";
  // cardContainer.style.margin = "0";
  // cardContainer.style.padding = "0";
  // cardContainer.style.display = "flex";
  // cardContainer.style.justifyContent = "center";
  // cardContainer.style.alignItems = "center"; 
  cardContainer.innerHTML = ` 
  <div style="background-color: #fff; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); padding: 20px; max-width: 300px; margin: 0 auto; text-align: center;">
  <div style="align-items: center; display: flex; margin-top: 0px;">
      <img id="goBackImg" src="https://img.icons8.com/ios-filled/50/left.png" style="height: 20px; width: 20px;">
      <div style="text-align: center; margin: 0 auto; color:#4285f4;">
          <h4>Conspire Commerce Extension</h4>
      </div>
  </div>

  <h2 class="vreg1">Sign Up</h2>
  <h2 class="vlog1">Log In</h2>

  <form style="display: flex; flex-direction: column;">
      <label class="vreg" style="margin-bottom: 0px;" for="name">Name:</label>
      <input class="vreg" style="padding: 8px; margin-bottom: 5px; border: 1px solid #ccc; border-radius: 3px;" type="text" id="name" name="name" required>
      <br class="vreg">
      <label style="margin-bottom: 0px;" for="email">Email:</label>
      <input style="padding: 8px; margin-bottom: 5px; border: 1px solid #ccc; border-radius: 3px;" type="text" id="email" name="email" required>
      <br>
      <label style="margin-bottom: 0px;" for="password">Password:</label>
      <input style="padding: 8px; margin-bottom: 5px; border: 1px solid #ccc; border-radius: 3px;" type="password" id="password" name="password" required>
      <br>
      <input class="vreg1" style="padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 3px; background-color: #4285f4; color: #fff; cursor: pointer;" id="signUpBtn" type="button" value="Sign Up">
      <input class="vlog1" style="padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 3px; background-color: #4285f4; color: #fff; cursor: pointer;" id="loginButton" type="button" value="Login">
  </form>

  <h3 class="vreg">Already have an account?</h3>
  <input class="vreg" style="padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 3px; background-color: #4285f4; color: #fff; cursor: pointer;" id="showLoginButton" type="button" value="Login">

  <h3 class="vlog">Dont have an account?</h3>
  <input class="vlog" style="padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 3px; background-color: #4285f4; color: #fff; cursor: pointer;" id="showRegButton" type="button" value="Register">
</div>

  `;
  overlayDiv.appendChild(cardContainer);
  InjectLoginJS(); //injectJS 
  function InjectLoginJS() {
    document.getElementById("goBackImg").addEventListener("click", OnBackClicked);
    const tryLogInSignUP = async (data) => {
      try {
        const userLogin = await sendBGMessageAsync({ action: data.name ? "TrySignUp" : "TryLogin", data: data });
        if (userLogin) {
          OnBackClicked(); ShowDashboardView(userLogin);
        }
        else {
          signUpBtn.style.pointerEvents = "auto"; loginButton.style.pointerEvents = "auto";
          if (data.name) showMessage("Unable to register user with this email address");
          else showMessage("Invalid Username or Password");
        }
      } catch (error) {
        signUpBtn.style.pointerEvents = "auto"; loginButton.style.pointerEvents = "auto";
        if (data.name) showMessage("Unable to register user with this email address");
        else showMessage("Invalid Username or Password");
        console.log(error);
      }
    };
    async function SignUpBtnClick() {
      let name = document.getElementById('name').value;
      let email = document.getElementById('email').value;
      let password = document.getElementById('password').value;
      if (!name || !email || !password) {
        showMessage("Pls enter name, email and password", "warning");
      }
      else if (password.length < 8) {
        showMessage("Password must be at least 8 characters", "warning");
      }
      else {
        showLoading(); signUpBtn.style.pointerEvents = "none";
        await tryLogInSignUP({ name: name, email: email, password: password });
      }
    }
    async function LoginBtnClick() {
      let email = document.getElementById('email').value;
      let password = document.getElementById('password').value;
      if (!email || !password) {
        showMessage("Pls enter email and password", "warning");
      } else {
        showLoading(); loginButton.style.pointerEvents = "none";
        await tryLogInSignUP({ email: email, password: password });
      }
    }

    function hideShowElementsWithClass(className, value) {
      var elements = document.getElementsByClassName(className);
      for (var i = 0; i < elements.length; i++) {
        if (value)
          elements[i].style.display = value;
        else
          elements[i].style.removeProperty("display");
      }
    }

    function ShowRegClick() {
      hideShowElementsWithClass("vreg", "inline-block");
      hideShowElementsWithClass("vreg1", "block");
      hideShowElementsWithClass("vlog", "none");
      hideShowElementsWithClass("vlog1", "none");
    }
    function ShowLoginClick() {
      hideShowElementsWithClass("vlog", "inline-block");
      hideShowElementsWithClass("vlog1", "block");
      hideShowElementsWithClass("vreg", "none");
      hideShowElementsWithClass("vreg1", "none");
    }
    ShowLoginClick();
    let signUpBtn = document.getElementById('signUpBtn');
    if (signUpBtn) signUpBtn.addEventListener('click', SignUpBtnClick);
    let loginButton = document.getElementById('loginButton');
    if (loginButton) loginButton.addEventListener('click', LoginBtnClick);
    let showRegButton = document.getElementById("showRegButton");
    if (showRegButton) showRegButton.addEventListener('click', ShowRegClick);
    let showLoginButton = document.getElementById("showLoginButton");
    if (showLoginButton) showLoginButton.addEventListener('click', ShowLoginClick);

  }
}
//dash main 
let userData = {}; var _chat = {}; var chat_id = "null";
let oldChats = []; let canObserve = false; let share_conspire_url = null;
function ShowDashboardView(userLogin) {
  userData = userLogin;
  overlayDiv.style.top = "150px"; overlayDiv.innerHTML = "";
  overlayDiv.style.backgroundColor = "transparent";
  //injectStyles
  const style = document.createElement("style");
  style.textContent = `  
   
  .dashboard-container {
    display: flex;
  }
  
  .dashboard-div,
  .card-div {
    display: none;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    max-width: 300px;
    margin: 0 auto;
    text-align: center;
  }
  
  .button-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .dashboard-div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .dashboard-div button {
    width: 100%;
    padding: 10px;
    margin: 5px 0;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #3366cc;
    color: #fff;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .dashboard-div button:hover {
    background-color: #f0f0f0;
  }
  
  .dashboard-div h2 {
    margin: 0;
    color: #3366cc;
  }
  
  .user-info-div {
    display: flex;
    align-items: center;
    margin: 10px 0px;
  }
  
  .user-info-div img {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    margin-right: 20px;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .user-info h4,
  .user-info h3,
  .user-info h4#useremailSpan {
    margin: 0;
  }
   
  .user-info h3 span {
    font-weight: bold;
    color: #3366cc; 
  }
  
  
  #myChatsPage {
    padding: 20px;  
  }
  
  .chat-list {
    display: grid;
    gap: 20px;
    grid-template-columns: auto 1fr;
  }
  
  .chat-group-item {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
    background-color: #fff;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    align-items: center;
    width: max-content;
  }
  
  .chat-group-item img {
    width: 50px;
    height: 50px;
    border-radius: 25%;
    grid-row: span 2;
  }
  
  .info {
    display: flex;
    flex-direction: column;
    width: max-content;
  }
  
  .info h3,
  .info span {
    margin: 0;
    width: 100%;
  }
  
  #groupImage{
    width: 40px;
    height: 40px; 
  }
  
  #chatPage { 
    flex-direction: column;
    height: 60vh;
    width:  90vh;
    background-color: #e0e5ef;
  }
  
  html {
    overflow: scroll;
    overflow-x: hidden;
  }
  ::-webkit-scrollbar {
    width: 0;   
    background: transparent;   
  } 
  ::-webkit-scrollbar-thumb {
    background: transparent;
  }
  
  #chatBody {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    overflow-y: scroll; 
    background-color: #fff;
    padding: 0px 10px;
    border-radius: 10px;
  }  
  .chatBody::-webkit-scrollbar { 
    display: none;  /* Safari and Chrome */
  }
  #chatInput {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    align-items: center;
  }
  
  #messageInput {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: small;
  }
  
  #sendMessageBtn {
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    width: 20px;
    height: 20px;
  }
  
  #selectImageButton {
    padding: 5px;
    border: 1px solid #3366cc;
    border-radius: 5px;
    width: 30px;
    height: 30px;
  }
  
  .message-template-out {
    margin-bottom: 10px;
    width: max-content;
    text-align: end;
    align-self: end;
    padding: 0px;
  }
  
  .msout {
    background-color: #3366cc;
    color: #fff; 
    border-radius: 10px;
    text-align: end;
    padding: 5px 15px;
    margin: 5px 0px;
  }
  
  .message-template-in {
    margin-bottom: 10px;
    width: max-content;
    text-align: start;
    align-self: flex-start;
    padding: 0px;
  }
  
  .msin {
    background-color: #000;
    color: mediumspringgreen; 
    border-radius: 10px;
    text-align: start;
    padding: 5px 15px;
    margin: 5px 0px;
  }
  
  .message-image {
    max-width: 100%;
    max-height: 150px; 
    border-radius: 5px;
    margin-top: 5px;
  }
  
  .message-time {
    margin-top: 5px;
    font-size: 0.8em;
  }
  
  .message-sender {
    font-weight: bold;
  }
   
  .sent-message .message-sender,
  .received-message .message-sender {
    margin-top: 5px;
  }
  `;
  overlayDiv.appendChild(style);
  //injectHTML
  const cardContainer = document.createElement("div");
  cardContainer.classList.add("card");
  cardContainer.innerHTML = `
  <div class="dashboard-container">
    <!-- Dashboard Div -->
    <div class="dashboard-div" id="dashboard_div" style="display: block;">

    <div style="align-items: center; display: flex; margin-top: 0px;">
    <img id="goBackImg" src="https://img.icons8.com/ios-filled/50/left.png" style="height: 20px; width: 20px;">
    <div style="text-align: center; margin: 0 auto;">
        <h2>Conspire Commerce Extension</h2>
    </div>
    </div> 

      <!-- User Info Div -->
      <div class="user-info-div">
        <img id="userImg" src="https://img.icons8.com/external-flaticons-flat-flat-icons/64/external-user-web-flaticons-flat-flat-icons-2.png">
        <div class="user-info">
          <h3>Welcome, <span id="usernameSpan"></span></h3>
          <h4 id="useremailSpan"></h4>
        </div>
      </div>

      <!-- Card Buttons -->
      <div class="button-container">
        <button id="createChatBtn">Create Chat</button>
        <button id="joinChatBtn">Join Chat</button>
        <button id="myChatBtn">My Chat</button> 
        <button id="logoutBtn" style="background-color: #d33;">Logout</button>
      </div>
    </div>

    <!-- Card Divs -->
    <div class="card-div" id="myChats">
      <div style="align-items: center; display: flex; margin-top: 0px;">
        <img id="back1" src="https://img.icons8.com/ios-filled/50/left.png" style="height: 20px; width: 20px;">
        <div style="text-align: center; margin: 0 auto;">
          <h2 style="color: #3366cc;">My Chats</h2>
        </div>
      </div>
      <div id="chatList" class="chat-list">
        <!-- Chat groups will be dynamically added here -->
      </div>
    </div>

    <div class="card-div" id="chatPage" style="display: none; font-size: small;">
      <div style="align-items: center; display: flex; margin-top: 0px;">
        <img id="back2" src="https://img.icons8.com/ios-filled/50/left.png" style="height: 20px; width: 20px;">
        <div class="chat-group-item" style="margin: 0 auto; background-color: transparent;">
          <img id="groupImage" src="https://img.icons8.com/external-flaticons-flat-flat-icons/64/external-user-web-flaticons-flat-flat-icons-2.png">
          <div class="info">
            <h3 id="groupName" style="color: #000;">Chat Group Name</h3>
            <span id="creatorName">By: Me</span>
            <a id="inviteIcon" style="color: blue; display: none;">Invite User by Email</a>
          </div>
        </div>
      </div>

      <div id="chatBody">
        <!-- Message Templates (Initially Hidden) -->
        <div class="chat-group-item message-template-out" id="sentTextTemplate" style="display: none;"> 
          <div class="sent-message">
            <span class="message-sender"></span>
            <div style="display: flex; justify-content: flex-end; align-items: center;">
              <div style="width: fit-content; max-width: 200px;">
                <p class="message-content msout"></p> 
              </div>
            </div>
            <span class="message-time"></span>
          </div> 
          <div>
            <img src="https://img.icons8.com/external-flaticons-flat-flat-icons/64/external-user-web-flaticons-flat-flat-icons-2.png" class="sender-image" style="width: 30px; height: 30px; border-radius: 50%;">   
          </div>
        </div>

        <div class="chat-group-item message-template-in" id="receivedTextTemplate" style="display: none;">
          <div>
            <img src="https://img.icons8.com/external-flaticons-flat-flat-icons/64/external-user-web-flaticons-flat-flat-icons-2.png" class="sender-image" style="width: 30px; height: 30px; border-radius: 50%;">   
          </div>
          <div class="received-message">
            <span class="message-sender"></span>
            <div style="display: flex; justify-content: flex-start; align-items: center;">
              <div style="width: fit-content; max-width: 200px;">
                <p class="message-content msin"></p> 
              </div>
            </div>
            <span class="message-time"></span>
          </div>
        </div>

        <div class="chat-group-item message-template-out" id="sentImageTemplate" style="display: none;"> 
          <div class="sent-message">
            <span class="message-sender"></span>
            <div style="display: flex; justify-content: flex-end; align-items: center;">
              <div style="width: fit-content; max-width: 200px;">
                <img class="message-image" style="width: 100px; height: 70px; object-fit: scale-down;"> 
              </div>
            </div>
            <span class="message-time"></span>
          </div> 
          <div>
            <img src="https://img.icons8.com/external-flaticons-flat-flat-icons/64/external-user-web-flaticons-flat-flat-icons-2.png" class="sender-image" style="width: 30px; height: 30px; border-radius: 50%;">   
          </div>
        </div>
        
        <div class="chat-group-item message-template-in" id="receivedImageTemplate" style="display: none;">
          <div>
            <img src="https://img.icons8.com/external-flaticons-flat-flat-icons/64/external-user-web-flaticons-flat-flat-icons-2.png" class="sender-image" style="width: 30px; height: 30px; border-radius: 50%;">   
          </div>
          <div class="received-message">
            <span class="message-sender"></span>
            <div style="display: flex; justify-content: flex-start; align-items: center;">
              <div style="width: fit-content; max-width: 200px;">
                <img class="message-image" style="width: 100px; height: 70px; object-fit: scale-down;"> 
             </div>
            </div>
            <span class="message-time"></span>
          </div> 
        </div> 

        <!-- Actual Messages will be dynamically added here -->
      </div>
      <div id="chatInput">
        <img id="selectImageButton" src="https://img.icons8.com/sf-regular/48/upload.png">
        <textarea type="text" id="messageInput" placeholder="Type your message..."></textarea>
        <img id="sendMessageBtn" src="https://img.icons8.com/ios-filled/50/paper-plane.png">
      </div>

    </div> 
  </div>
  `;
  overlayDiv.appendChild(cardContainer);
  //injectJS
  injectDashJS();
  function injectDashJS() {
    document.getElementById("goBackImg").addEventListener("click", OnBackClicked);
    function SetDashUserDataView() {
      let usernameSpan = document.getElementById("usernameSpan");
      if (usernameSpan) {
        let userName = userData.name;
        if (userName.length > 11) {
          userName = userName.substring(0, 10) + "\n" + userName.substring(10, userName.length - 1);
        }
        usernameSpan.innerText = userName;
      }
      let useremailSpan = document.getElementById("useremailSpan");
      if (useremailSpan) {
        let userEmail = userData.email;
        if (userEmail.length > 21) {
          userEmail = userEmail.substring(0, 20) + "\n" + userEmail.substring(20, userEmail.length - 1);
        }
        useremailSpan.innerText = userEmail;
      }
      let userImg = document.getElementById("userImg");
      if (userImg && userData.photo) {
        userImg.src = userData.photo;
        userImg.addEventListener('click', uploadProfilePicture);
      }
    }
    SetDashUserDataView();

    function toggleCard(cardId, status) {
      var cardDiv = document.getElementById(cardId);
      var dashboardDiv = document.getElementById('dashboard_div');
      if (status == true) {
        dashboardDiv.style.display = 'none';
        if (cardId === "chatPage")
          cardDiv.style.display = 'flex';
        else
          cardDiv.style.display = 'block';
      } else {
        dashboardDiv.style.display = 'block';
        cardDiv.style.display = 'none';
      }
    }

    async function logout() {
      let logOuting = confirm("Are you sure you want to logout?");
      if (logOuting) {
        chrome.runtime.sendMessage({ action: "PerformLogout" });
        OnBackClicked(); //location.reload();
      }
    }

    async function PerformCreateChat() {
      let chat_name = prompt("Enter name for your chat room");
      try {
        if (!chat_name) { if (chat_name == "") showMessage("Pls enter valid chat room name", "error"); return; }
        showLoading();
        if (chat_name.length > 25) chat_name = chat_name.substring(0, 24);
        const chatCreated = await sendBGMessageAsync({ action: "PerformCreateChat", chat_name: chat_name, user: userData });
        if (chatCreated) {
          showMessage("Chat room created successfully", "success");
          GoToChatPage(chatCreated);
        }
        else showMessage("Error Occurred creating room with name provided", "error");
      } catch (error) {
        showMessage("Error Occurred creating room", "error");
        console.log(error);
      }
    }

    async function PerformJoinChat() {
      let entered_chat_id = prompt("Enter Chat ID of the room you want to join");
      try {
        if (!entered_chat_id) { if (entered_chat_id == "" || (entered_chat_id && !entered_chat_id.includes("-"))) showMessage("Pls enter valid chat room ID", "error"); return; }
        showLoading();
        const chatJoinedStringList = await sendBGMessageAsync({ action: "PerformJoinChat", chat_id: entered_chat_id, user: userData });
        if (chatJoinedStringList) {
          showMessage(chatJoinedStringList[0], chatJoinedStringList[1]);
          if (chatJoinedStringList[1] == "success") myChatBtnClicked();
        }
        else showMessage("Error Occurred joining room with Chat ID provided", "error");
      } catch (error) {
        showMessage("Error Occurred joining the chat room", "error");
        console.log(error);
      }
    }

    function UpdateChatView(myChatsData) {
      if (myChatsData && myChatsData.length != 0) {
        try {
          let chatBody = document.getElementById("chatBody");
          myChatsData.forEach(chatSnap => {
            let chat = chatSnap;//.val();
            if (!oldChats.includes(chat.id)) {
              oldChats.push(chat.id);
              let msgType = chat.messageType; const senderID = chat.senderID;
              let templateId = "sentTextTemplate"; //temp 
              if (senderID === userData.uid) {
                chat.sender = "You";
                templateId = msgType === "text" ? "sentTextTemplate" : "sentImageTemplate";
              } else {
                templateId = msgType === "text" ? "receivedTextTemplate" : "receivedImageTemplate";
              }
              let messageTemplate = document.getElementById(templateId).cloneNode(true);
              messageTemplate.style.display = ""; // Show the cloned template
              if (msgType === "text") {
                messageTemplate.querySelector(".message-content").innerText = chat.message;
                if (chat.url) {
                  let aTag = document.createElement("a");
                  aTag.href = chat.url; aTag.style.color = "cyan";
                  aTag.target = "_blank"; aTag.innerText = "Product Link";
                  messageTemplate.querySelector(".message-content").appendChild(aTag);
                }
              }
              messageTemplate.querySelector(".message-time").innerText = chat.datetime;
              messageTemplate.querySelector(".message-sender").innerText = chat.sender;
              if (chat.senderImage) messageTemplate.querySelector(".sender-image").src = chat.senderImage;
              if (msgType === "image") {
                messageTemplate.querySelector(".message-image").src = chat.image;
                // messageTemplate.querySelector(".message-image").addEventListener("click",
                //   () => Swal.fire({
                //     imageUrl: chat.image,
                //     imageHeight: 250,
                //     showCloseButton: true,
                //     confirmButtonText: 'CLOSE'
                //   }));
              }
              // Append the cloned template to the chatBody 
              chatBody.appendChild(messageTemplate);
              chatBody.scrollTop = chatBody.scrollHeight;
            }
          });
        } catch (error) {
          showMessage("Error loading chat body", "error");
          console.log(error);
        }
      }
    }

    async function StartObservingChat() {
      try {
        const myChatPageLoaded = await sendBGMessageAsync({ action: "ObserveChat", chat_id: chat_id });
        if (myChatPageLoaded && myChatPageLoaded.length > 0) {
          UpdateChatView(myChatPageLoaded);
        }
        if (canObserve) setTimeout(StartObservingChat, 2000);
      } catch (error) {
        if (canObserve) setTimeout(StartObservingChat, 2000);
        console.log(error);
      }
    }

    function GoToChatPage(chatGroup) {
      try {
        _chat = chatGroup; ClearForNewChatView();
        chat_id = _chat.id + "-" + _chat.creator_id;
        toggleCard("myChats", false); toggleCard("chatPage", true);
        document.getElementById("groupName").innerText = chatGroup.name;
        document.getElementById("creatorName").innerText = "By: " + chatGroup.creator;
        if (chatGroup.photo) {
          let groupImage = document.getElementById("groupImage");
          if (groupImage) groupImage.src = chatGroup.photo;
        }
        StartObservingChat();
      } catch (error) {
        showMessage("Unable to load Chat", "error");
        console.log(error);
      }
    }

    function ClearForNewChatView() {
      oldChats = []; canObserve = true;
      let chatBody = document.getElementById("chatBody");
      chatBody.innerHTML = ` 
      <!-- Message Templates (Initially Hidden) -->
      <div class="chat-group-item message-template-out" id="sentTextTemplate" style="display: none;"> 
        <div class="sent-message">
          <span class="message-sender"></span>
          <div style="display: flex; justify-content: flex-end; align-items: center;">
            <div style="width: fit-content; max-width: 200px;">
              <p class="message-content msout"></p> 
            </div>
          </div>
          <span class="message-time"></span>
        </div> 
        <div>
          <img src="https://img.icons8.com/external-flaticons-flat-flat-icons/64/external-user-web-flaticons-flat-flat-icons-2.png" class="sender-image" style="width: 30px; height: 30px; border-radius: 50%;">   
        </div>
      </div>

      <div class="chat-group-item message-template-in" id="receivedTextTemplate" style="display: none;">
        <div>
          <img src="https://img.icons8.com/external-flaticons-flat-flat-icons/64/external-user-web-flaticons-flat-flat-icons-2.png" class="sender-image" style="width: 30px; height: 30px; border-radius: 50%;">   
        </div>
        <div class="received-message">
          <span class="message-sender"></span>
          <div style="display: flex; justify-content: flex-start; align-items: center;">
            <div style="width: fit-content; max-width: 200px;">
              <p class="message-content msin"></p> 
            </div>
          </div>
          <span class="message-time"></span>
        </div>
      </div>

      <div class="chat-group-item message-template-out" id="sentImageTemplate" style="display: none;"> 
        <div class="sent-message">
          <span class="message-sender"></span>
          <div style="display: flex; justify-content: flex-end; align-items: center;">
            <div style="width: fit-content; max-width: 200px;">
              <img class="message-image" style="width: 100px; height: 70px; object-fit: scale-down;"> 
            </div>
          </div>
          <span class="message-time"></span>
        </div> 
        <div>
          <img src="https://img.icons8.com/external-flaticons-flat-flat-icons/64/external-user-web-flaticons-flat-flat-icons-2.png" class="sender-image" style="width: 30px; height: 30px; border-radius: 50%;">   
        </div>
      </div>
      
      <div class="chat-group-item message-template-in" id="receivedImageTemplate" style="display: none;">
        <div>
          <img src="https://img.icons8.com/external-flaticons-flat-flat-icons/64/external-user-web-flaticons-flat-flat-icons-2.png" class="sender-image" style="width: 30px; height: 30px; border-radius: 50%;">   
        </div>
        <div class="received-message">
          <span class="message-sender"></span>
          <div style="display: flex; justify-content: flex-start; align-items: center;">
            <div style="width: fit-content; max-width: 200px;">
              <img class="message-image" style="width: 100px; height: 70px; object-fit: scale-down;"> 
           </div>
          </div>
          <span class="message-time"></span>
        </div> 
      </div> 

      <!-- Actual Messages will be dynamically added here --> 
      `;
      if (_chat.creator_id == userData.uid)
        document.getElementById("inviteIcon").style.display = "block";
      else
        document.getElementById("inviteIcon").style.display = "none";
    }

    async function myChatBtnClicked() {
      try {
        showLoading();
        const myChatLoaded = await sendBGMessageAsync({ action: "MyChatList", user: userData });
        if (myChatLoaded && myChatLoaded.length > 0) {
          showMyChatsReturn(myChatLoaded);
        }
      } catch (error) {
        showMessage("Unable to find Chat Room", "error");
        GoBackFromChat(); console.log(error);
      }
    }
    function showMyChatsReturn(myChatsData) {
      if (myChatsData && myChatsData.length != 0) {
        showLoading(false); toggleCard("myChats", true);
        const chatList = document.getElementById("chatList");
        chatList.innerHTML = ""; let chatFound = false;
        myChatsData.forEach(chatSnap => {
          chatFound = true;
          let chatGroup = chatSnap;//.val();
          const listItem = document.createElement("div");
          listItem.className = "chat-group-item";
          let imgTag = "<img src=\"https://img.icons8.com/external-flaticons-flat-flat-icons/64/external-user-web-flaticons-flat-flat-icons-2.png\">";
          if (chatGroup.photo) imgTag = `<img src="${chatGroup.photo}">`;
          listItem.innerHTML = `${imgTag}<div class="info"><h3>
                                ${chatGroup.name}</h3><span>By: ${chatGroup.creator}</span></div>`;
          listItem.addEventListener("click", () => GoToChatPage(chatGroup));
          chatList.appendChild(listItem);
          const br = document.createElement("br"); chatList.appendChild(br);
        });
        if (!chatFound) {
          showMessage("No Chatroom found, pls join or create a chatroom", "warning");
          GoBackFromChat();
        }
      } else {
        showMessage("No Chat Room Found, pls join or create a chatroom", "error");
        GoBackFromChat();
      }
    }

    async function sendMessage() {
      // Get the input message
      const messageInput = document.getElementById("messageInput");
      if (messageInput.value) {
        let oldMessage = messageInput.value;
        let message = messageInput.value; messageInput.value = "";
        try {
          let chatModel = {
            messageType: "text", senderID: userData.uid,
            datetime: getCurrentTime(), sender: userData.name
          };
          if (userData.photo) chatModel.senderImage == userData.photo;
          if (share_conspire_url && message.includes(share_conspire_url)) {
            //IF NEEDED TO REMOVE, use onInputEmptyInstead
            chatModel.url = share_conspire_url;
            message = message.replace(share_conspire_url, "");
            share_conspire_url = null;
          }
          chatModel.message = message; let msgID = Date.now(); chatModel.id = msgID;
          const chatSent = await sendBGMessageAsync({ action: "sendChatDB", chatModel: chatModel, chat_id: chat_id });
          if (!chatSent) {
            showMessage("Unable to send message", "error");
            messageInput.value = oldMessage; console.log(error);
          }
        } catch (error) {
          showMessage("Unable to send message", "error");
          messageInput.value = oldMessage; console.log(error);
        }
      }
    }
    function shareWebProductFromChat() {
      const messageInput = document.getElementById("messageInput");
      let url = window.location.href;
      let titleElement = document.getElementsByTagName('title')[0];
      let title = titleElement ? titleElement.textContent : "Title not found";
      share_conspire_url = url; messageInput.value = title + "\n" + url;
    }
    function getCurrentTime() {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    function GoBackFromChat() {
      canObserve = false;
      toggleCard("chatPage", false); toggleCard("myChats", false);
    }
    async function inviteUser() {
      let inviteEmail = prompt("Enter email address to invite to your chat room, then send this chat ID for them to join: " + chat_id);
      try {
        if (!inviteEmail) { if (inviteEmail == "") showMessage("Pls enter email address", "error"); return; } showLoading();
        const inviteResponse = await sendBGMessageAsync({ action: "inviteUser", inviteEmail: inviteEmail, user: userData, chat: _chat });
        showMessage(inviteResponse, "error");
      } catch (error) {
        showMessage("Error Occurred invited the user", "error");
        console.log(error);
      }
    }


    function uploadProfilePicture() {
      return;
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      input.multiple = true; input.click();
      input.addEventListener('change', handleFileSelection);
      function handleFileSelection() {
        const files = input.files;
        if (files.length > 0) {
          Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function (e) {
              let imageData = e.target.result;
              chrome.runtime.sendMessage({ action: "sentToFirebaseStorage", imageData: imageData, userData: userData });
            };
            reader.readAsDataURL(file);
          });
        } else {
          showMessage('Please select at least one image file.', "error");
        }
      }
    }

    let createChatBtn = document.getElementById("createChatBtn");
    if (createChatBtn) createChatBtn.addEventListener('click', PerformCreateChat);
    let joinChatBtn = document.getElementById("joinChatBtn");
    if (joinChatBtn) joinChatBtn.addEventListener('click', PerformJoinChat);
    let myChatBtn = document.getElementById("myChatBtn");
    if (myChatBtn) myChatBtn.addEventListener('click', myChatBtnClicked);
    let logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    let back1 = document.getElementById("back1");
    if (back1) back1.addEventListener('click', GoBackFromChat);
    let back2 = document.getElementById("back2");
    if (back2) back2.addEventListener('click', GoBackFromChat);
    let sendMessageBtn = document.getElementById("sendMessageBtn");
    if (sendMessageBtn) sendMessageBtn.addEventListener('click', sendMessage);
    let inviteIcon = document.getElementById("inviteIcon");
    if (inviteIcon) inviteIcon.addEventListener('click', inviteUser);
    let chatImgBtn = document.getElementById("selectImageButton");
    if (chatImgBtn) chatImgBtn.addEventListener('click', shareWebProductFromChat);

  }
}
//done
console.log("Ecommerce extension loadded");