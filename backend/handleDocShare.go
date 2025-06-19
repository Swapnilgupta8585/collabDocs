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

type Link struct {
	Token      string `json:"token"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	DocID      uuid.UUID `json:"doc_id"`
	Permission string `json:"permission"`
	ExpiresAt  time.Time `json:"expires_at"`
}


func (cfg *ApiConfig) handleDocShare(w http.ResponseWriter, r *http.Request){

	// request body
	type parameter struct{
		DocID string `json:"doc_id"`
		Permission string `json:"permission"`
	}

	// response struct
	type response struct {
		Link Link `json:"link"`
	}

	// decode the request body
	reqParam := parameter{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&reqParam)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Error decoding the request body", err)
		return
	}

	// check if the permission is in valid format or not
	if reqParam.Permission != "edit" && reqParam.Permission!= "view"{
		RespondWithError(w, http.StatusBadRequest, "Invalid Permission format", nil)
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
	_, err = auth.ValidateJWT(tokenString, cfg.SecretToken)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorised user", err)
		return
	}

	//parse the docID to be an UUID
	DocID, err := uuid.Parse(reqParam.DocID)
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
	// if doc.UserID != userId {
	// 	RespondWithError(w, http.StatusForbidden, "user is not the owner of this resource", nil)
	// 	return
	// }

	// create a random string for the token
	token := make([]byte, 32)
	_, err = rand.Read(token)
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Error creating a random token", err)
		return
	}

	// encode the random bits to a string using hexadecimal encoding
	linkToken := hex.EncodeToString(token)

	// create link with expiry of 24 hours
	link, err := cfg.Db.CreateLink(r.Context(), database.CreateLinkParams{
		Token: linkToken,
		DocID: doc.ID,
		Permission: reqParam.Permission,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	})
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Error creating the link in the Database", err)
		return
	}

	// response with link
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