package main

import (
	"net/http"

	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	"github.com/google/uuid"
)

// handleGetDocs retrieves a document by its ID if the requesting user is the owner.
func (cfg *ApiConfig) handleGetDocs(w http.ResponseWriter, r *http.Request) {
	// Response struct
	type response struct {
		Doc Doc `json:"doc"`
	}

	// Extract the Authorization token from the header.
	header := r.Header
	tokenString, err := auth.GetBearerToken(header)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Missing or invalid Authorization token", err)
		return
	}

	// Validate the token and get the associated user ID.
	userId, err := auth.ValidateJWT(tokenString, cfg.SecretToken)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Invalid or expired token", err)
		return
	}

	// Extract and parse the document ID from the path.
	doc_id := r.PathValue("DocID")
	DocID, err := uuid.Parse(doc_id)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid document ID format", err)
		return
	}

	// Fetch the document from the database.
	doc, err := cfg.Db.GetDocByID(r.Context(), DocID)
	if err != nil {
		RespondWithError(w, http.StatusNotFound, "Document not found", err)
		return
	}

	// Check if the user owns the document.
	if doc.UserID != userId {
		RespondWithError(w, http.StatusForbidden, "You do not have permission to view this document", nil)
		return
	}

	// Return the document.
	RespondWithJSON(w, http.StatusOK, response{Doc: Doc{
		ID:        doc.ID,
		DocName:   doc.DocName,
		CreatedAt: doc.CreatedAt,
		UpdatedAt: doc.UpdatedAt,
		UserID:    doc.UserID,
		Content:   doc.Content,
	}})

}
