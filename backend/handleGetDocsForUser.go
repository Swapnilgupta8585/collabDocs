package main

import (
	"net/http"
	"sort"

	"github.com/Swapnilgupta8585/collabDocs/internal/auth"

)


func (cfg *ApiConfig) handleGetDocsForUser(w http.ResponseWriter, r *http.Request){
	// response struct
	type response struct {
		Docs []Doc `json:"docs"`
	}

	// get the header of request
	header := r.Header

	// get the JWTtoken string
	tokenString, err := auth.GetBearerToken(header)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Error getting the token string from header", err)
		return
	}

	// validate the token string and get the user id
	userId, err := auth.ValidateJWT(tokenString, cfg.SecretToken)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorised user", err)
		return
	}

	// get docs for the user from DB
	docs, err := cfg.Db.GetDocsByUserID(r.Context(), userId)
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Error getting the docs", err)
		return
	}

	// creating a slice of Doc type
	Docs := make([]Doc, len(docs))

	// populating the Docs with Doc
	for i, doc := range docs{
		Docs[i] = Doc{
			ID: doc.ID,
			DocName: doc.DocName,
			CreatedAt: doc.CreatedAt,
			UpdatedAt: doc.UpdatedAt,
			UserID: doc.UserID,
			Content: doc.Content,
		}
	}

	// get the sort query parameter
	sortingQuery := r.URL.Query().Get("sort")

	// if desc then sort in descending order of created_at
	if sortingQuery == "desc"{
		sort.Slice(Docs, func(i, j int) bool {return Docs[i].CreatedAt.After(Docs[j].CreatedAt)})
	} else {
		sort.Slice(Docs, func(i, j int) bool {return Docs[i].CreatedAt.Before(Docs[j].CreatedAt)})
	}

	// response
	RespondWithJSON(w, http.StatusOK, response{Docs: Docs})
}