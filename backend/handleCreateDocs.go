package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	"github.com/Swapnilgupta8585/collabDocs/internal/database"
	"github.com/google/uuid"
)

// Doc represents a document owned by a user.
type Doc struct{
	ID uuid.UUID `json:"id"`
	DocName string `json:"doc_name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	UserID uuid.UUID `json:"user_id"`
	Content string `json:"content"`
}

// handleCreateDocs handles the creation of a new document for an authenticated user.
func (cfg *ApiConfig) handleCreateDocs(w http.ResponseWriter, r *http.Request){

	// Define the expected request body parameters.
	type parameter struct {
		DocName string `json:"doc_name"`
	}

	// Define the response structure.
	type response struct{
		Doc Doc `json:"doc"`
	}

	// Extract the Authorization header and parse the Bearer token.
	header := r.Header
	tokenString, err := auth.GetBearerToken(header)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Authorization token missing or invalid", err)
		return
	}

	// Validate the token and extract the user ID.
	userId, err := auth.ValidateJWT(tokenString, cfg.SecretToken)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Invalid or expired token", err)
		return
	}

	// Parse the JSON request body.
	reqParam := parameter{}
	decoder := json.NewDecoder(r.Body)
	err = decoder.Decode(&reqParam)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Malformed JSON in request body", err)
		return
	}

	// create the doc
	doc, err := cfg.Db.CreateDoc(r.Context(), database.CreateDocParams{DocName:reqParam.DocName, UserID: userId, Content: ""})
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Failed to create document", err)
		return
	}

	// Return the created document with HTTP 201 Created.
	RespondWithJSON(w, http.StatusCreated, response{
		Doc: Doc{
			ID: doc.ID,
			DocName: doc.DocName,
			CreatedAt: doc.CreatedAt,
			UpdatedAt: doc.UpdatedAt,
			UserID: doc.UserID,
			Content: "",
		},
	})
}