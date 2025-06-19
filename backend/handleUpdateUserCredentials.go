package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	"github.com/Swapnilgupta8585/collabDocs/internal/database"

)

// handleUpdateUserCredential update the email and password if the user provide valid access token
func (cfg *ApiConfig) handleUpdateUserCredentials(w http.ResponseWriter, r *http.Request){
	// request body parameters
	type parameters struct{
		Password string `json:"password"`
		Email string `json:"email"`
	}

	//response struct
	type response struct{
		User User `json:"user"`
	}

	//decoding the request body parameter into our parameters struct
	param := parameters{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&param)
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Error decoding the json", err)
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

	// create a hash for new password
	hashPassword, err := auth.HashPassword(param.Password)
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Error Creating hash password", err)
		return
	}

	//store the updated hashPassword in the database
	err = cfg.Db.AddHashPassword(r.Context(), database.AddHashPasswordParams{HashedPassword: hashPassword, ID: userId})
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Error adding the updated hashPassword to the database", err)
		return
	}

	// update the email stored in the database
	err = cfg.Db.UpdateEmailOfUser(r.Context(), database.UpdateEmailOfUserParams{Email: param.Email, ID: userId})
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Error adding the updated email to the database", err)
		return
	}

	// get the updated user from the database by using updated email
	user, err := cfg.Db.GetUserByEmail(r.Context(), param.Email)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Error getting User From the Database using updated Email", err)
		return
	}

	fmt.Println("successfully updated")

	// if everything is fine respond with json
	RespondWithJSON(w, http.StatusOK,response{
		User: User{
			ID : user.ID,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
			Email: user.Email,
		},
	} )
}
