package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	"github.com/Swapnilgupta8585/collabDocs/internal/database"
	"github.com/google/uuid"
)

func (cfg *ApiConfig) handleUpdateDocs(w http.ResponseWriter, r *http.Request) {
	//request body
	type parameter struct {
		Content string `json:"content"`
	}

	// response struct
	type response struct {
		Doc Doc `json:"doc"`
	}

	// decode the request body
	reqParam := parameter{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&reqParam)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Error decoding the request body", err)
		return
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
		return
	}

	// update the doc's content in the DB
	err = cfg.Db.UpdateContent(r.Context(), database.UpdateContentParams{Content: reqParam.Content, ID: doc.ID})
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Error updating the content field of the doc table", err)
		return
	}
	fmt.Println("updated the db with content in the doc table")

	// response
	RespondWithJSON(w, http.StatusOK, response{Doc: Doc{
		ID:        doc.ID,
		DocName:   doc.DocName,
		CreatedAt: doc.CreatedAt,
		UpdatedAt: doc.UpdatedAt,
		UserID:    doc.UserID,
		Content:   reqParam.Content,
	}})

}
