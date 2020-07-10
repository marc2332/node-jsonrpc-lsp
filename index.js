const ws = require("ws")
const rpcServer = require("@sourcegraph/vscode-ws-jsonrpc/lib/server")

const DEFAULT_PORT = 3000

function toSocket(webSocket) {
	return {
		send: content => webSocket.send(content),
		onMessage: cb => webSocket.onmessage = event => cb(event.data),
		onError: cb => webSocket.onerror = event => {
			if ('message' in event) {
				cb(event.message)
			}
		},
		onClose: cb => webSocket.onclose = event => cb(event.code, event.reason),
		dispose: () => webSocket.close()
	}
}


function nodeJSONRPC({ languageServers, port }){
	const serverPort = port || DEFAULT_PORT

	const wss = new ws.Server({
		port: serverPort,
		perMessageDeflate: false
	})

	wss.on('connection', (client, request ) => {
		let langServer;
		Object.keys(languageServers).filter( key => {
			if ( request.url === `/${key}` ) {
				langServer = languageServers[key];
			}
		});
		if ( !langServer || !langServer.length ){
			return client.close();
		}
		let localConnection = rpcServer.createServerProcess('jsonrpc', langServer[0], langServer.slice(1));
		let socket = toSocket(client);
		let connection = rpcServer.createWebSocketConnection(socket);
		rpcServer.forward(connection, localConnection);
		socket.onClose((code, reason) => {
			localConnection.dispose()
		})
	})
	return {
		addLanguageServer(name, args){
			languageServers[name] = args
		}
	}
}

module.exports = nodeJSONRPC