package main

import "net/http"


// handleHealth responds with a simple 200 OK status to indicate server health.
func handleHealth(w http.ResponseWriter, r *http.Request) {
	// Set the response content type.
	w.Header().Set("Content-Type","text/plain; charset=utf-8")

	// Write HTTP status code.
	w.WriteHeader(http.StatusOK)

	// Write status text (e.g., "OK") to the response body.
	w.Write([]byte(http.StatusText(http.StatusOK)))
}