package main

import (
	"encoding/json"
	"net/http"
)

// handleResolveToken resolves a share token and returns document ID, content, and permission.
func (cfg *ApiConfig)handleResolveToken(w http.ResponseWriter, r *http.Request) {

	// Expected request body.
	type parameter struct{
		Token string `json:"token"`
	}

	// Response payload.
	type response struct{
		DocID string `json:"docId"`
		Content string `json:"content"`
		Permission string `json:"permission"`
	}

	// Decode JSON request body.
	reqParam := parameter{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&reqParam)
	if err != nil{
		RespondWithError(w, http.StatusBadRequest, "Invalid JSON. Please check the request body format.", err)
		return
	}

	// Look up document info using the token.
	docInfo, err := cfg.Db.GetDocInfoFromToken(r.Context(), reqParam.Token)
	if err != nil{
		RespondWithError(w, http.StatusNotFound, "Token is invalid or expired", err)
		return
	}

	// Respond with document data.
	RespondWithJSON(w, http.StatusOK, response{DocID:docInfo.ID.String(), Content: docInfo.Content, Permission: docInfo.Permission})
}