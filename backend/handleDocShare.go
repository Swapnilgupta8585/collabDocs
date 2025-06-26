package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"time"

	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	"github.com/Swapnilgupta8585/collabDocs/internal/database"
	"github.com/google/uuid"
)

// Link represents a shared document link with permissions and expiration.
type Link struct {
	Token      string `json:"token"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	DocID      uuid.UUID `json:"doc_id"`
	Permission string `json:"permission"`
	ExpiresAt  time.Time `json:"expires_at"`
}


func (cfg *ApiConfig) handleDocShare(w http.ResponseWriter, r *http.Request){

	// Expected request body.
	type parameter struct{
		DocID string `json:"doc_id"`
		Permission string `json:"permission"`
	}

	// Response struct
	type response struct {
		Link Link `json:"link"`
	}

	// Parse the request body.
	reqParam := parameter{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&reqParam)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Malformed JSON in request body", err)
		return
	}

	// Validate permission.
	if reqParam.Permission != "edit" && reqParam.Permission!= "view"{
		RespondWithError(w, http.StatusBadRequest, "Permission must be 'view' or 'edit'", nil)
		return
	}

	// Extract and validate JWT from Authorization header.
	header := r.Header
	tokenString, err := auth.GetBearerToken(header)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Missing or invalid Authorization token", err)
		return
	}

	// Validate the Token 
	_, err = auth.ValidateJWT(tokenString, cfg.SecretToken)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Invalid or expired token", err)
		return
	}

	// Parse document ID from string to UUID.
	DocID, err := uuid.Parse(reqParam.DocID)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid document ID format", err)
		return
	}

	// Retrieve the document from the database.
	doc, err := cfg.Db.GetDocByID(r.Context(), DocID)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Error getting the doc using doc id from the DB", err)
		return
	}

	// check whether the user is the owner for the doc or not
	// if doc.UserID != userId {
	// 	RespondWithError(w, http.StatusForbidden, "user is not the owner of this resource", nil)
	// 	return
	// }

	// create a random string for the token
	token := make([]byte, 32)
	_, err = rand.Read(token)
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Failed to generate share token", err)
		return
	}

	// Encode the random bits to a string using hexadecimal encoding
	linkToken := hex.EncodeToString(token)

	// Create the shareable link in the database with a 24-hour expiration.
	link, err := cfg.Db.CreateLink(r.Context(), database.CreateLinkParams{
		Token: linkToken,
		DocID: doc.ID,
		Permission: reqParam.Permission,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	})
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Failed to create shareable link", err)
		return
	}

	// Return the created link.
	RespondWithJSON(w, http.StatusCreated, response{
		Link: Link{
		Token: link.Token,
		CreatedAt: link.CreatedAt,
		UpdatedAt: link.UpdatedAt,
		DocID: link.DocID,
		Permission: link.Permission,
		ExpiresAt: link.ExpiresAt,
	},
	})
}