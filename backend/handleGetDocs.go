package main

import (
	"fmt"
	"net/http"

	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	"github.com/google/uuid"
)

func (cfg *ApiConfig) handleGetDocs(w http.ResponseWriter, r *http.Request) {
	// response struct
	type response struct {
		Doc Doc `json:"doc"`
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

	// get doc by DocID
	doc_id := r.PathValue("DocID")

	//parse the docID to be an UUID
	DocID, err := uuid.Parse(doc_id)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Error parsing the DocID", err)
		return
	}

	// get the doc by id from the DB
	doc, err := cfg.Db.GetDocByID(r.Context(), DocID)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Error getting the doc using doc id from the DB", err)
		return
	}

	// check whether the user is the owner for the doc or not
	if doc.UserID != userId {
		RespondWithError(w, http.StatusForbidden, "user is not the owner of this resource", nil)
		fmt.Println("user is not the owner of this resource")
		return
	}

	// response
	RespondWithJSON(w, http.StatusOK, response{Doc: Doc{
		ID:        doc.ID,
		DocName:   doc.DocName,
		CreatedAt: doc.CreatedAt,
		UpdatedAt: doc.UpdatedAt,
		UserID:    doc.UserID,
		Content:   doc.Content,
	}})

}
