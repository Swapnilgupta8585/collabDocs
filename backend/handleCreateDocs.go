package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	"github.com/Swapnilgupta8585/collabDocs/internal/database"
	"github.com/google/uuid"
)

type Doc struct{
	ID uuid.UUID `json:"id"`
	DocName string `json:"doc_name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	UserID uuid.UUID `json:"user_id"`
	Content string `json:"content"`
}


func (cfg *ApiConfig) handleCreateDocs(w http.ResponseWriter, r *http.Request){

	// request paramter
	type parameter struct {
		DocName string `json:"doc_name"`
	}

	// response struct
	type response struct{
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

	// decode the request body
	reqParam := parameter{}
	decoder := json.NewDecoder(r.Body)
	err = decoder.Decode(&reqParam)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid JSON. Please check the request body format.", err)
		return
	}

	// create the doc
	doc, err := cfg.Db.CreateDoc(r.Context(), database.CreateDocParams{DocName:reqParam.DocName, UserID: userId, Content: ""})
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Error creating a doc in the database", err)
		return
	}

	// respond with the doc
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