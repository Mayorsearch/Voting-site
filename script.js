// Login elements
let loginSection = document.getElementById("loginSection");
let loginForm = document.getElementById("loginForm");
let loginMessage = document.getElementById("loginMessage");
let votingContent = document.getElementById("votingContent");
let logoutBtn = document.getElementById("logoutBtn");
let displayVoterName = document.getElementById("displayVoterName");
let displayVoterID = document.getElementById("displayVoterID");

// Select vote count elements
let apcVotes = document.getElementById("apcVotes");
let pdpVotes = document.getElementById("pdpVotes");
let accordVotes = document.getElementById("accordVotes");

// Vote bars for styling
let apcBar = document.getElementById("apcBar");
let pdpBar = document.getElementById("pdpBar");
let accordBar = document.getElementById("accordBar");

// Percentages
let apcPercent = document.getElementById("apcPercent");
let pdpPercent = document.getElementById("pdpPercent");
let accordPercent = document.getElementById("accordPercent");

// Crown elements
let apcCrown = document.getElementById("apcCrown");
let pdpCrown = document.getElementById("pdpCrown");
let accordCrown = document.getElementById("accordCrown");

// Initialize vote counts from localStorage
let voteCounts = JSON.parse(localStorage.getItem("voteCounts")) || {
    apc: 0,
    pdp: 0,
    accord: 0
};

let apcVotescount = voteCounts.apc;
let pdpVotescount = voteCounts.pdp;
let accordVotescount = voteCounts.accord;

// Vote limit to declare a winner
const VOTE_LIMIT = 20;

// Select the form, submit button, and message area
let voteForm = document.getElementById("voteForm");
let submitBtn = document.getElementById("submit-btn");
let message = document.getElementById("message");

// Chat elements
let chatSection = document.getElementById("chatSection");
let chatForm = document.getElementById("chatForm");
let chatInput = document.getElementById("chatInput");
let chatMessages = document.getElementById("chatMessages");

// User session data
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let registeredVoters = JSON.parse(localStorage.getItem("registeredVoters")) || {};

// Flag to track if voting has ended and voter info
let votingEnded = localStorage.getItem("votingEnded") === "true" || false;
let hasVoted = false;
let voterParty = "";
let voterNumber = 0;

// Initialize on page load
window.addEventListener("load", function() {
    checkLoginStatus();
    updateResults();
    checkIfVotingEnded();
    
    // Check for updates every second
    setInterval(function() {
        syncVoteCounts();
        loadChatMessages();
    }, 1000);
});

// Function to check login status
function checkLoginStatus() {
    if (currentUser) {
        // User is logged in
        showVotingContent();
        checkIfUserHasVoted();
    } else {
        // User is not logged in
        showLoginSection();
    }
}

// Function to show login section
function showLoginSection() {
    loginSection.style.display = "block";
    votingContent.style.display = "none";
}

// Function to show voting content
function showVotingContent() {
    loginSection.style.display = "none";
    votingContent.style.display = "block";
    
    // Display user info
    displayVoterName.textContent = currentUser.name;
    displayVoterID.textContent = currentUser.voterID;
}

// Function to check if current user has already voted
function checkIfUserHasVoted() {
    if (registeredVoters[currentUser.voterID]) {
        let voterData = registeredVoters[currentUser.voterID];
        if (voterData.hasVoted) {
            hasVoted = true;
            voterParty = voterData.party;
            voterNumber = voterData.voterNumber;
            showChatSection();
            loadChatMessages();
            
            message.textContent = "You have already voted for " + voterParty + ". You can chat with other voters.";
            message.style.color = "orange";
        }
    }
}

// Function to handle login
function handleLogin(e) {
    e.preventDefault();
    
    let name = document.getElementById("voterName").value.trim();
    let voterID = document.getElementById("voterID").value.trim();
    let email = document.getElementById("voterEmail").value.trim();
    
    // Validate inputs
    if (name.length < 3) {
        loginMessage.textContent = "Name must be at least 3 characters long!";
        loginMessage.style.color = "red";
        return;
    }
    
    if (voterID.length < 5) {
        loginMessage.textContent = "Voter ID must be at least 5 characters long!";
        loginMessage.style.color = "red";
        return;
    }
    
    // Check if voter ID already exists
    if (registeredVoters[voterID]) {
        // Existing voter - verify details
        let existingVoter = registeredVoters[voterID];
        if (existingVoter.name !== name || existingVoter.email !== email) {
            loginMessage.textContent = "Voter ID exists but details don't match. Please check your information.";
            loginMessage.style.color = "red";
            return;
        }
    } else {
        // New voter - register them
        registeredVoters[voterID] = {
            name: name,
            email: email,
            voterID: voterID,
            hasVoted: false,
            party: "",
            voterNumber: 0,
            registeredAt: new Date().toISOString()
        };
        localStorage.setItem("registeredVoters", JSON.stringify(registeredVoters));
    }
    
    // Create user session
    currentUser = {
        name: name,
        email: email,
        voterID: voterID
    };
    
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    
    // Show success message
    loginMessage.textContent = "Login successful! Redirecting...";
    loginMessage.style.color = "green";
    
    // Redirect to voting page after 1 second
    setTimeout(function() {
        checkLoginStatus();
    }, 1000);
}

// Function to handle logout
function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("currentUser");
        currentUser = null;
        
        // Reset form
        loginForm.reset();
        loginMessage.textContent = "";
        
        // Show login section
        showLoginSection();
    }
}

// Function to sync vote counts from localStorage
function syncVoteCounts() {
    let storedCounts = JSON.parse(localStorage.getItem("voteCounts")) || {
        apc: 0,
        pdp: 0,
        accord: 0
    };
    
    apcVotescount = storedCounts.apc;
    pdpVotescount = storedCounts.pdp;
    accordVotescount = storedCounts.accord;
    
    updateResults();
    checkIfVotingEnded();
}

// Function to check if voting has ended
function checkIfVotingEnded() {
    let ended = localStorage.getItem("votingEnded") === "true";
    
    if (ended && !votingEnded) {
        votingEnded = true;
        submitBtn.disabled = true;
        
        let winner = localStorage.getItem("winner");
        if (winner) {
            showCrown(winner.toLowerCase());
            message.textContent = winner + " has reached 20 votes and is the winner!";
            message.style.color = "green";
            message.style.fontWeight = "bold";
        }
    }
}

// Function to update percentages and bars
function updateResults() {
    let totalVotes = apcVotescount + pdpVotescount + accordVotescount;

    let apcP = totalVotes ? ((apcVotescount / totalVotes) * 100).toFixed(1) : 0;
    let pdpP = totalVotes ? ((pdpVotescount / totalVotes) * 100).toFixed(1) : 0;
    let accordP = totalVotes ? ((accordVotescount / totalVotes) * 100).toFixed(1) : 0;

    apcVotes.innerHTML = apcVotescount;
    pdpVotes.innerHTML = pdpVotescount;
    accordVotes.innerHTML = accordVotescount;

    apcPercent.innerHTML = apcP + "%";
    pdpPercent.innerHTML = pdpP + "%";
    accordPercent.innerHTML = accordP + "%";

    apcBar.style.width = apcP + "%";
    pdpBar.style.width = pdpP + "%";
    accordBar.style.width = accordP + "%";
}

// Function to show crown for winner
function showCrown(partyValue) {
    if (partyValue === "apc") {
        apcCrown.style.display = "block";
    } else if (partyValue === "pdp") {
        pdpCrown.style.display = "block";
    } else if (partyValue === "accord") {
        accordCrown.style.display = "block";
    }
}

// Function to handle winner
function checkWinner(candidateName, candidateCount, partyValue) {
    if (candidateCount >= VOTE_LIMIT) {
        votingEnded = true;
        localStorage.setItem("votingEnded", "true");
        localStorage.setItem("winner", candidateName);
        
        submitBtn.disabled = true;
        
        showCrown(partyValue);
        
        message.textContent = candidateName + " has reached 20 votes and is the winner!";
        message.style.color = "green";
        message.style.fontWeight = "bold";
        
        alert(candidateName + " has reached 20 votes and is the winner!");
        
        return true;
    }
    return false;
}

// Function to show chat section
function showChatSection() {
    chatSection.style.display = "block";
    setTimeout(function() {
        chatSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
}

// Function to handle voting
function votecount(e) {
    e.preventDefault();

    if (votingEnded) {
        message.textContent = "Voting has ended!";
        message.style.color = "orange";
        return;
    }

    if (hasVoted) {
        message.textContent = "You have already voted!";
        message.style.color = "orange";
        return;
    }

    let selectedParty = document.querySelector('input[name="party"]:checked');

    if (!selectedParty) {
        message.textContent = "Please select a party to vote for!";
        message.style.color = "red";
        return;
    }

    hasVoted = true;
    voterParty = selectedParty.value.toUpperCase();
    
    message.textContent = "";

    if (selectedParty.value === "apc") {
        apcVotescount++;
        voterNumber = apcVotescount;
        voteCounts.apc = apcVotescount;
        localStorage.setItem("voteCounts", JSON.stringify(voteCounts));
        updateResults();
        checkWinner("APC", apcVotescount, "apc");
    } else if (selectedParty.value === "pdp") {
        pdpVotescount++;
        voterNumber = pdpVotescount;
        voteCounts.pdp = pdpVotescount;
        localStorage.setItem("voteCounts", JSON.stringify(voteCounts));
        updateResults();
        checkWinner("PDP", pdpVotescount, "pdp");
    } else if (selectedParty.value === "accord") {
        accordVotescount++;
        voterNumber = accordVotescount;
        voteCounts.accord = accordVotescount;
        localStorage.setItem("voteCounts", JSON.stringify(voteCounts));
        updateResults();
        checkWinner("ACCORD", accordVotescount, "accord");
    }
    
    // Update voter record
    registeredVoters[currentUser.voterID].hasVoted = true;
    registeredVoters[currentUser.voterID].party = voterParty;
    registeredVoters[currentUser.voterID].voterNumber = voterNumber;
    registeredVoters[currentUser.voterID].votedAt = new Date().toISOString();
    localStorage.setItem("registeredVoters", JSON.stringify(registeredVoters));

    showChatSection();
    
    message.textContent = "Your vote has been recorded! You can now chat with other voters.";
    message.style.color = "green";
}

// Function to load chat messages from localStorage
function loadChatMessages() {
    let messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    let currentMessageCount = chatMessages.children.length;
    
    if (messages.length > currentMessageCount) {
        for (let i = currentMessageCount; i < messages.length; i++) {
            displayChatMessage(messages[i]);
        }
    }
}

// Function to display a chat message
function displayChatMessage(msgData) {
    let messageDiv = document.createElement("div");
    messageDiv.className = "chat-message";
    
    messageDiv.innerHTML = `
        <div class="voter-name">${msgData.voterName}</div>
        <div class="message-text">${msgData.text}</div>
        <div class="message-time">${msgData.time}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to add message to chat
function addChatMessage(voterName, messageText) {
    let now = new Date();
    let timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    let msgData = {
        voterName: voterName,
        text: messageText,
        time: timeString,
        timestamp: now.getTime()
    };
    
    let messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    messages.push(msgData);
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    
    displayChatMessage(msgData);
}

// Function to handle chat submission
function handleChatSubmit(e) {
    e.preventDefault();
    
    let messageText = chatInput.value.trim();
    
    if (messageText === "") {
        return;
    }
    
    let voterName = voterParty + " Voter " + voterNumber;
    addChatMessage(voterName, messageText);
    
    chatInput.value = "";
}

// Attach event listeners
loginForm.addEventListener("submit", handleLogin);
logoutBtn.addEventListener("click", handleLogout);
voteForm.addEventListener("submit", votecount);
chatForm.addEventListener("submit", handleChatSubmit);
