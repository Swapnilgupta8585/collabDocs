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
		DocId   string `json:"docId"`
		Token   string `json:"token"`
		Content string `json:"content"`
	}

	// decode the request body
	reqParam := parameter{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&reqParam)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid request body", err)
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

	//parse the docID to be an UUID
	DocID, err := uuid.Parse(reqParam.DocId)
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

	// if editor is the owner then check using userId for updating
	if userId != uuid.Nil && doc.UserID == userId {
		// update the doc's content in the DB
		err = cfg.Db.UpdateContent(r.Context(), database.UpdateContentParams{Content: reqParam.Content, ID: doc.ID})
		if err != nil {
			RespondWithError(w, http.StatusInternalServerError, "Error updating the content field of the doc table", err)
			return
		}
		fmt.Println("updated the db with content in the doc table")

		// respond with a no content status code
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// if there is token in the body and user is not the owner of the doc, use token for updating the doc
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

		// check for permission for updating
		if docInfo.Permission != "edit" {
			RespondWithError(w, http.StatusForbidden, "You don't have edit permission", nil)
			return
		}

		// update the doc's content in the DB
		err = cfg.Db.UpdateContent(r.Context(), database.UpdateContentParams{Content: reqParam.Content, ID: docInfo.ID})
		if err != nil {
			RespondWithError(w, http.StatusInternalServerError, "Error updating the content field of the doc table", err)
			return
		}
		fmt.Println("updated the db with content in the doc table")

		// respond with a no content status code
		w.WriteHeader(http.StatusNoContent)
	}

}
