package main

import (
	"fmt"
	"net/http"

	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	"github.com/google/uuid"

)

// handleDeleteDocs deletes a document if the requesting user is the owner.
func (cfg *ApiConfig) handleDeleteDocs(w http.ResponseWriter, r *http.Request){
	// Extract the JWT token from the Authorization header.
	header := r.Header
	tokenString, err := auth.GetBearerToken(header)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Authorization token missing or invalid", err)
		return
	}

	// Validate the token and retrieve the associated user ID.
	userId, err := auth.ValidateJWT(tokenString, cfg.SecretToken)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Invalid or expired token", err)
		return
	}

	// Retrieve the document ID from the URL path and parse it.
	doc_id := r.PathValue("DocID")
	DocID, err := uuid.Parse(doc_id)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid document ID format", err)
		return
	}

	// Fetch the document from the database.
	doc, err := cfg.Db.GetDocByID(r.Context(), DocID)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to retrieve document from the database", err)
		return
	}

	// check whether the user is the owner for the doc or not
	if doc.UserID != userId {
		RespondWithError(w, http.StatusForbidden, "You do not have permission to delete this document", nil)
		return
	}

	// Delete the document from the database.
	err = cfg.Db.DeleteDocByID(r.Context(), doc.ID)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to delete document", err)
		return
	}
	fmt.Println("deleted the doc from the db successfully!")

	// Respond with 204 No Content on successful deletion.
	w.WriteHeader(http.StatusNoContent)
}