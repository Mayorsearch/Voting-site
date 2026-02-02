// Simple client-side voting demo.
// Stores vote counts and whether this browser voted in localStorage.
// Not a production voting system.

(function(){
  const PARTIES = ["apc","pdp","accord"];
  const DEFAULT_VOTES = { apc: 12, pdp: 8, accord: 4 }; // seed demo numbers
  const LS_VOTES = "demo_votes_v1";
  const LS_VOTED = "demo_voted_v1";

  const els = {
    form: document.getElementById("voteForm"),
    message: document.getElementById("message"),
    submitBtn: document.getElementById("submitBtn"),
    clearBtn: document.getElementById("clearBtn"),
    totalVotes: document.getElementById("totalVotes"),
    yourVote: document.getElementById("yourVote"),
    // per-party
    apcVotes: document.getElementById("apcVotes"),
    pdpVotes: document.getElementById("pdpVotes"),
    accordVotes: document.getElementById("accordVotes"),
    apcPercent: document.getElementById("apcPercent"),
    pdpPercent: document.getElementById("pdpPercent"),
    accordPercent: document.getElementById("accordPercent"),
    apcBar: document.getElementById("apcBar"),
    pdpBar: document.getElementById("pdpBar"),
    accordBar: document.getElementById("accordBar"),
  };

  function readVotes(){
    try {
      const raw = localStorage.getItem(LS_VOTES);
      if(!raw) {
        // initialize with a small seed so UI looks alive
        localStorage.setItem(LS_VOTES, JSON.stringify(DEFAULT_VOTES));
        return Object.assign({}, DEFAULT_VOTES);
      }
      return JSON.parse(raw);
    } catch(e){
      console.error("Failed to read votes:", e);
      return Object.assign({}, DEFAULT_VOTES);
    }
  }

  function saveVotes(votes){
    localStorage.setItem(LS_VOTES, JSON.stringify(votes));
  }

  function readVoted(){
    try {
      return JSON.parse(localStorage.getItem(LS_VOTED)) || null;
    } catch(e){
      return null;
    }
  }

  function saveVoted(record){
    localStorage.setItem(LS_VOTED, JSON.stringify(record));
  }

  function total(votes){
    return PARTIES.reduce((s,k)=> s + (votes[k] || 0), 0);
  }

  function render(){
    const votes = readVotes();
    const t = total(votes) || 0;

    // counts
    els.apcVotes.textContent = votes.apc || 0;
    els.pdpVotes.textContent = votes.pdp || 0;
    els.accordVotes.textContent = votes.accord || 0;

    // percentages (safe)
    const apcPct = t ? Math.round((votes.apc / t) * 100) : 0;
    const pdpPct = t ? Math.round((votes.pdp / t) * 100) : 0;
    const accordPct = t ? Math.round((votes.accord / t) * 100) : 0;

    els.apcPercent.textContent = apcPct + "%";
    els.pdpPercent.textContent = pdpPct + "%";
    els.accordPercent.textContent = accordPct + "%";

    // bars (set width)
    requestAnimationFrame(()=>{
      els.apcBar.style.width = apcPct + "%";
      els.pdpBar.style.width = pdpPct + "%";
      els.accordBar.style.width = accordPct + "%";
    });

    // totals and user status
    els.totalVotes.textContent = t;
    const voted = readVoted();
    if(voted && voted.choice){
      els.yourVote.textContent = `You voted: ${voted.choice.toUpperCase()} (${new Date(voted.when).toLocaleString()})`;
      // disable controls to prevent re-vote
      disableForm(true);
      els.message.textContent = "Thanks — your vote has been recorded locally in this browser.";
      els.message.style.color = "var(--muted)";
    } else {
      els.yourVote.textContent = "You haven't voted yet";
      disableForm(false);
      els.message.textContent = "";
    }
  }

  function disableForm(disable){
    const inputs = document.querySelectorAll('input[name="party"]');
    inputs.forEach(i => i.disabled = disable);
    els.submitBtn.disabled = disable;
  }

  function handleSubmit(e){
    e.preventDefault();
    const fd = new FormData(els.form);
    const choice = fd.get("party");
    if(!choice){
      els.message.textContent = "Select a party before submitting.";
      els.message.style.color = "crimson";
      return;
    }
    const already = readVoted();
    if(already && already.choice){
      els.message.textContent = `You already voted for ${already.choice.toUpperCase()}. Reset demo to vote again.`;
      els.message.style.color = "crimson";
      return;
    }

    // apply vote
    const votes = readVotes();
    votes[choice] = (votes[choice] || 0) + 1;
    saveVotes(votes);
    saveVoted({ choice, when: new Date().toISOString() });
    render();
    // announce
    els.message.textContent = "Vote submitted. Thank you.";
    els.message.style.color = "var(--success)";
  }

  function handleClear(){
    const ok = confirm("Reset demo data in this browser? This will clear votes and allow new vote from this browser.");
    if(!ok) return;
    localStorage.removeItem(LS_VOTES);
    localStorage.removeItem(LS_VOTED);
    // re-seed with defaults
    localStorage.setItem(LS_VOTES, JSON.stringify(DEFAULT_VOTES));
    render();
    els.message.textContent = "Demo data reset.";
    els.message.style.color = "var(--muted)";
  }

  // keyboard: allow Enter on a selected radio to submit
  function handleKey(e){
    if(e.key === "Enter"){
      // if focus in the form, submit
      if(els.form.contains(document.activeElement)){
        els.form.requestSubmit();
      }
    }
  }

  // init
  function init(){
    // Attach handlers
    els.form.addEventListener("submit", handleSubmit);
    els.clearBtn.addEventListener("click", handleClear);
    document.addEventListener("keydown", handleKey);
    render();
  }

  // Run
  init();

})();
