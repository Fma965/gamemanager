<html>
<body>
  <form id="input-form">
    <label for="message">Enter Message:</label>
    <input type="text" id="message" name="message"><br><br>
    <input type="submit" value="Send">
  </form>
  <div id="messages"></div>

  <script>
    const webSocket = new WebSocket('https://games-ws.f9.casa');
    webSocket.onmessage = (event) => {
      console.log(event)
      document.getElementById('messages').innerHTML +=
        'Message from server: ' + event.data + "<br>";
    };
    webSocket.addEventListener("open", () => {
      console.log("We are connected");
    });
    function sendMessage(event) {
        var inputMessage = document.getElementById('message')

        const msg = {
            type: "random",
            text: inputMessage.value,
            date: Date.now(),
        };

  // Send the msg object as a JSON-formatted string.
        webSocket.send(JSON.stringify(msg));
        inputMessage.value = ""
        event.preventDefault();
    }
    document.getElementById('input-form').addEventListener('submit', sendMessage);
  </script>
</body>
</html>
