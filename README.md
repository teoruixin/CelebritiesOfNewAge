## IS428 Visual Analytics for Business Intelligence

To run the D3 Dashboard:
1) Open the CLI and navigate to the root folder
2) Run `server.cmd` in the CLI.
  * The server.cmd file executes the following code: `python -m http.server 9001`
3) Access the dashboard at localhost:9001

Depending on local computer settings, you may need to execute `python3 -m http.server 9001` instead, and/or change the port number to an available port.

Alternatively, access the dashboard via WAMP/MAMP/XAMPP by moving the repository to the `www` folder of the server application.

Please ensure an internet connection as we are accessing CDNs for D3.js, bootstrap.js, vue.js, and others.