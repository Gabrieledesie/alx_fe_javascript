let quotes = [];
let lastSyncTime = null;

// Load quotes from localStorage or use defaults
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: "The only limit is your mind.", category: "Motivation" },
      { text: "Creativity takes courage.", category: "Inspiration" },
      { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
    ];
    saveQuotes();
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show one random quote
function showRandomQuote() {
  const i = Math.floor(Math.random() * quotes.length);
  const q = quotes[i];
  document.getElementById("quoteDisplay").innerHTML =
    `<p><strong>${q.category}:</strong> "${q.text}"</p>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(q));
}

// Add new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const cat = document.getElementById("newQuoteCategory").value.trim();
  if (text && cat) {
    quotes.push({ text, category: cat });
    saveQuotes();
    alert("Quote added!");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    populateCategories();
    filterQuotes();
  } else {
    alert("Please fill in both fields.");
  }
}

// Build form using JS
function createAddQuoteForm() {
  const box = document.getElementById("formContainer");

  const input1 = document.createElement("input");
  input1.type = "text";
  input1.placeholder = "Enter a new quote";
  input1.id = "newQuoteText";

  const input2 = document.createElement("input");
  input2.type = "text";
  input2.placeholder = "Enter quote category";
  input2.id = "newQuoteCategory";

  const btn = document.createElement("button");
  btn.textContent = "Add Quote";
  btn.onclick = addQuote;

  box.appendChild(input1);
  box.appendChild(input2);
  box.appendChild(btn);
}

// Export quotes to JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        alert("Quotes imported!");
        populateCategories();
        filterQuotes();
      }
    } catch (e) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Populate the category filter dropdown
function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  dropdown.innerHTML = "";

  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "All Categories";
  dropdown.appendChild(allOpt);

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    dropdown.appendChild(opt);
  });

  const stored = localStorage.getItem("selectedCategoryFilter");
  if (stored) dropdown.value = stored;
}

// Filter quotes by category
function filterQuotes() {
  const val = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategoryFilter", val);

  const box = document.getElementById("quoteDisplay");
  box.innerHTML = "";

  const filtered = val === "all" ? quotes : quotes.filter(q => q.category === val);
  if (filtered.length === 0) {
    box.innerHTML = "<p>No quotes found for this category.</p>";
  } else {
    filtered.forEach(q => {
      const p = document.createElement("p");
      p.innerHTML = `<strong>${q.category}:</strong> "${q.text}"`;
      box.appendChild(p);
    });
  }
}

// Simulated server sync: get quotes from mock server
async function syncWithServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverQuotes = await response.json();

    // Simulate server quotes by mapping them into quote format
    const mapped = serverQuotes.slice(0, 5).map(item => ({
      text: item.title,
      category: "ServerSync"
    }));

    const current = JSON.stringify(quotes);
    const incoming = JSON.stringify(mapped);

    if (current !== incoming) {
      quotes = [...quotes, ...mapped];
      quotes = removeDuplicates(quotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      notifyUser("🔄 Synced with server. Conflicts resolved: Server data added.");
    }

    lastSyncTime = new Date().toLocaleTimeString();
  } catch (err) {
    notifyUser("⚠️ Failed to sync with server.");
  }
}

// Notify user of conflicts or sync
function notifyUser(message) {
  const note = document.getElementById("notification");
  note.textContent = message;
  setTimeout(() => (note.textContent = ""), 6000);
}

// Remove duplicate quotes (based on text + category)
function removeDuplicates(array) {
  const seen = new Set();
  return array.filter(q => {
    const key = q.text + "|" + q.category;
    return seen.has(key) ? false : seen.add(key);
  });
}

// Event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

// Initialize everything
loadQuotes();
populateCategories();
filterQuotes();
createAddQuoteForm();

// Start server sync every 30 seconds
syncWithServer();
setInterval(syncWithServer, 30000);
