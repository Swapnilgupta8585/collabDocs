package main

import (
	"encoding/json"
	"net/http"

	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	"github.com/Swapnilgupta8585/collabDocs/internal/database"
	"github.com/google/uuid"
)

// handleUpdateDocs updates the content of a document either by the owner or via a valid edit token.
func (cfg *ApiConfig) handleUpdateDocs(w http.ResponseWriter, r *http.Request) {
	// Request body structure
	type parameter struct {
		DocId   string `json:"docId"`
		Token   string `json:"token"`
		Content string `json:"content"`
	}

	// Decode the request body
	reqParam := parameter{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&reqParam)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Extract and validate JWT from header
	header := r.Header
	tokenString, err := auth.GetBearerToken(header)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Missing or malformed Authorization header", err)
		return
	}

	// validate the token string and get the user id
	userId, err := auth.ValidateJWT(tokenString, cfg.SecretToken)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Invalid or expired JWT", err)
		return
	}

	// Parse the document ID
	DocID, err := uuid.Parse(reqParam.DocId)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid document ID format", err)
		return
	}

	// Fetch the document by ID
	doc, err := cfg.Db.GetDocByID(r.Context(), DocID)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to retrieve document from database", err)
		return
	}

	// If user is the owner, allow update
	if userId != uuid.Nil && doc.UserID == userId {
		// update the doc's content in the DB
		err = cfg.Db.UpdateContent(r.Context(), database.UpdateContentParams{Content: reqParam.Content, ID: doc.ID})
		if err != nil {
			RespondWithError(w, http.StatusInternalServerError, "Failed to update document content", err)
			return
		}

		// respond with a no content status code
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// If user is not owner, fall back to shared link token (if provided)
	if reqParam.Token != "" {
		// get docinfo like docid, content and permissions(from link table)
		docInfo, err := cfg.Db.GetDocInfoFromToken(r.Context(), reqParam.Token)
		if err != nil {
			RespondWithError(w, http.StatusBadRequest, "Invalid Token", err)
			return
		}

		// check whether the token corresponds to the right doc or not
		if docInfo.ID != DocID {
			RespondWithError(w, http.StatusForbidden, "Token does not match the document", nil)
			return
		}

		// Validate edit permission
		if docInfo.Permission != "edit" {
			RespondWithError(w, http.StatusForbidden, "You don't have edit permission", nil)
			return
		}

		// Update document content
		err = cfg.Db.UpdateContent(r.Context(), database.UpdateContentParams{Content: reqParam.Content, ID: docInfo.ID})
		if err != nil {
			RespondWithError(w, http.StatusInternalServerError, "Failed to update document content", err)
			return
		}

		// respond with a no content status code
		w.WriteHeader(http.StatusNoContent)
	}

	// If neither owner nor valid edit token
	RespondWithError(w, http.StatusForbidden, "You are not authorized to update this document", nil)

}
