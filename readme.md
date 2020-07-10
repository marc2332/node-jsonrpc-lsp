based on https://github.com/wylieconlon/jsonrpc-ws-proxy

## ✍🏻 Usage

```javascript
const jsonRPC = require('node-jsonrpc-lsp')

jsonRPC({
	port: 2020,
	languageServers: {
		javascript: 'my-javascript-langserver.js'
	}
})

```