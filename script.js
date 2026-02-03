// Select vote count elements
let apcVotes = document.getElementById("apcVotes");
let pdpVotes = document.getElementById("pdpVotes");
let accordVotes = document.getElementById("accordVotes");

// Vote bars for styling (optional)
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

// Initialize vote counts
let apcVotescount = 0;
let pdpVotescount = 0;
let accordVotescount = 0;

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

// Flag to track if voting has ended and voter info
let votingEnded = false;
let hasVoted = false;
let voterParty = "";
let voterNumber = 0;

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
        submitBtn.disabled = true; // Disable voting button
        
        // Show crown for the winner
        showCrown(partyValue);
        
        // Display message in HTML
        message.textContent = candidateName + " has reached 20 votes and is the winner!";
        message.style.color = "green";
        message.style.fontWeight = "bold";
        
        // Show alert
        alert(candidateName + " has reached 20 votes and is the winner!");
        
        return true;
    }
    return false;
}

// Function to show chat section
function showChatSection() {
    chatSection.style.display = "block";
    // Scroll to chat section smoothly
    chatSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Function to handle voting
function votecount(e) {
    e.preventDefault();

    // Check if voting has already ended
    if (votingEnded) {
        message.textContent = "Voting has ended!";
        message.style.color = "orange";
        return;
    }

    // Check if user has already voted
    if (hasVoted) {
        message.textContent = "You have already voted!";
        message.style.color = "orange";
        return;
    }

    // Get selected party
    let selectedParty = document.querySelector('input[name="party"]:checked');

    if (!selectedParty) {
        message.textContent = "Please select a party to vote for!";
        message.style.color = "red";
        return;
    }

    // Mark as voted and store party
    hasVoted = true;
    voterParty = selectedParty.value.toUpperCase();

    // Clear any previous message
    message.textContent = "";

    // Increment the vote for the selected party and check for winner
    if (selectedParty.value === "apc") {
        apcVotescount++;
        voterNumber = apcVotescount;
        updateResults();
        checkWinner("APC", apcVotescount, "apc");
    } else if (selectedParty.value === "pdp") {
        pdpVotescount++;
        voterNumber = pdpVotescount;
        updateResults();
        checkWinner("PDP", pdpVotescount, "pdp");
    } else if (selectedParty.value === "accord") {
        accordVotescount++;
        voterNumber = accordVotescount;
        updateResults();
        checkWinner("ACCORD", accordVotescount, "accord");
    }

    // Show chat section after voting
    showChatSection();
    
    // Display success message
    message.textContent = "Your vote has been recorded! You can now chat with other voters.";
    message.style.color = "green";
}

// Function to add message to chat
function addChatMessage(voterName, messageText) {
    let messageDiv = document.createElement("div");
    messageDiv.className = "chat-message";
    
    let now = new Date();
    let timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        <div class="voter-name">${voterName}</div>
        <div class="message-text">${messageText}</div>
        <div class="message-time">${timeString}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to handle chat submission
function handleChatSubmit(e) {
    e.preventDefault();
    
    let messageText = chatInput.value.trim();
    
    if (messageText === "") {
        return;
    }
    
    // Create voter name
    let voterName = voterParty + " Voter " + voterNumber;
    
    // Add message to chat
    addChatMessage(voterName, messageText);
    
    // Clear input
    chatInput.value = "";
}

// Attach event listeners
voteForm.addEventListener("submit", votecount);
chatForm.addEventListener("submit", handleChatSubmit);
