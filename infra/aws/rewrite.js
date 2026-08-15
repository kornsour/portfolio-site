function handler(event) {
	var request = event.request;
	var uri = request.uri;

	if (uri === "/") {
		request.uri = "/index.html";
		return request;
	}

	// These generated metadata images intentionally have no file extension.
	if (uri === "/icon" || uri === "/opengraph-image") {
		return request;
	}

	if (uri.endsWith("/")) {
		uri = uri.slice(0, -1);
	}

	var fileName = uri.slice(uri.lastIndexOf("/") + 1);
	if (!fileName.includes(".")) {
		request.uri = uri + ".html";
	}

	return request;
}
