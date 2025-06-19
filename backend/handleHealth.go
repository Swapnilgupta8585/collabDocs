package main

import "net/http"


// checking the server health
func handleHealth(w http.ResponseWriter, r *http.Request) {
	// setting the header, also header should be set before writing the status code
	w.Header().Set("Content-Type","text/plain; charset=utf-8")

	// writing the status to the response body
	w.WriteHeader(http.StatusOK)

	// writing the data to the response body
	w.Write([]byte(http.StatusText(http.StatusOK)))
}