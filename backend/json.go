package main

import (
	"encoding/json"
	"log"
	"net/http"
)

// RespondWithError is a reusable function that will respond the error we will encounter as a JSON
func RespondWithError(w http.ResponseWriter, code int, msg string, err error){
	// if there is error log it
	if err != nil{
		log.Println(err)
	}

	// if there is an error message then log that as well
	if code > 499{
		log.Printf("Responding with 5XX error; %s", msg)
	}

	// create the error payload
	type errorResponse struct{
		Error string `json:"error"`
	}

	// respond with error code and payload with JSON
	RespondWithJSON(w, code, errorResponse{Error: msg})
}

// RespondWithJSON is a reusable function that will respond the response as a JSON
func RespondWithJSON(w http.ResponseWriter, code int, payload interface{}){
	// set the header of the response as application/json
	w.Header().Set("Content-Type","application/json")

	// marshal the payload into json data
	data, err := json.Marshal(payload)
	if err != nil{
		log.Printf("Error marshalling JSON: %v",err)
		w.WriteHeader(http.StatusInternalServerError)
	}

	// write the status code
	w.WriteHeader(code)

	// write the data
	w.Write(data)
}