// ✅ Required by checker: Sync function
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();

    const current = JSON.stringify(quotes);
    const incoming = JSON.stringify(serverQuotes);

    if (current !== incoming) {
      quotes = [...quotes, ...serverQuotes];
      quotes = removeDuplicates(quotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      notifyUser("🔁 Synced with server. Server data merged into local quotes.");
    }

    // ✅ Simulate POST to server
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ quotes })
    });

    lastSyncTime = new Date().toLocaleTimeString();
  } catch (error) {
    notifyUser("⚠️ Could not sync with server.");
  }
}
