package main

import (
	"encoding/json"
	"net/http"
)

func (cfg *ApiConfig)handleResolveToken(w http.ResponseWriter, r *http.Request) {

	// req body
	type parameter struct{
		Token string `json:"token"`
	}

	// response
	type response struct{
		DocID string `json:"docId"`
		Content string `json:"content"`
		Permission string `json:"permission"`
	}

	reqParam := parameter{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&reqParam)
	if err != nil{
		RespondWithError(w, http.StatusBadRequest, "Invalid JSON. Please check the request body format.", err)
		return
	}

	docInfo, err := cfg.Db.GetDocInfoFromToken(r.Context(), reqParam.Token)
	if err != nil{
		RespondWithError(w, http.StatusBadRequest, "Invalid Token", err)
		return
	}

	RespondWithJSON(w, http.StatusOK, response{DocID:docInfo.ID.String(), Content: docInfo.Content, Permission: docInfo.Permission})
}