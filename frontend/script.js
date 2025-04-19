fetch("https://your-backend-url/pair")
  .then(res => res.json())
  .then(data => {
    if (data.code) {
      document.getElementById("pairing-code").innerText = data.code;
    } else {
      document.getElementById("pairing-code").innerText = "No code found.";
    }
  })
  .catch(() => {
    document.getElementById("pairing-code").innerText = "Error loading code.";
  });
