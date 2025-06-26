package main

import (
	"net/http"
	"sort"

	"github.com/Swapnilgupta8585/collabDocs/internal/auth"

)

// handleGetDocsForUser returns all documents created by the authenticated user, optionally sorted by creation time.
func (cfg *ApiConfig) handleGetDocsForUser(w http.ResponseWriter, r *http.Request){
	// Response structure.
	type response struct {
		Docs []Doc `json:"docs"`
	}

	// Extract and validate the Authorization token.
	header := r.Header
	tokenString, err := auth.GetBearerToken(header)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Missing or invalid Authorization token", err)
		return
	}

	// validate the token string and get the user id
	userId, err := auth.ValidateJWT(tokenString, cfg.SecretToken)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Invalid or expired token", err)
		return
	}

	// Fetch documents created by the user.
	docs, err := cfg.Db.GetDocsByUserID(r.Context(), userId)
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Failed to retrieve documents", err)
		return
	}

	// Transform database docs into API response format.
	Docs := make([]Doc, len(docs))
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

	// Optional sorting by `created_at`
	sortingQuery := r.URL.Query().Get("sort")
	if sortingQuery == "desc"{
		sort.Slice(Docs, func(i, j int) bool {return Docs[i].CreatedAt.After(Docs[j].CreatedAt)})
	} else {
		sort.Slice(Docs, func(i, j int) bool {return Docs[i].CreatedAt.Before(Docs[j].CreatedAt)})
	}

	// Return sorted documents.
	RespondWithJSON(w, http.StatusOK, response{Docs: Docs})
}