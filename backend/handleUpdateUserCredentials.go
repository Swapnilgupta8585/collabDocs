package main

import (
	"encoding/json"
	"net/http"

	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	"github.com/Swapnilgupta8585/collabDocs/internal/database"

)

// handleUpdateUserCredentials updates a user's email and password if they provide a valid access token.
func (cfg *ApiConfig) handleUpdateUserCredentials(w http.ResponseWriter, r *http.Request){
	// Expected request body
	type parameters struct{
		Password string `json:"password"`
		Email string `json:"email"`
	}

	// Response struct
	type response struct{
		User User `json:"user"`
	}

	// Decode JSON request body
	param := parameters{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&param)
	if err != nil{
		RespondWithError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Extract and validate access token from header
	header := r.Header
	tokenString, err := auth.GetBearerToken(header)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Missing or malformed Authorization header", err)
		return
	}

	// validate the token string and get the user id
	userId, err := auth.ValidateJWT(tokenString, cfg.SecretToken)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Invalid or expired access token", err)
		return
	}

	// Hash the new password
	hashPassword, err := auth.HashPassword(param.Password)
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Failed to hash password", err)
		return
	}

	// Update password in the database
	err = cfg.Db.AddHashPassword(r.Context(), database.AddHashPasswordParams{HashedPassword: hashPassword, ID: userId})
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to update password in the database", err)
		return
	}

	// Update email in the database
	err = cfg.Db.UpdateEmailOfUser(r.Context(), database.UpdateEmailOfUserParams{Email: param.Email, ID: userId})
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Failed to update email in the database", err)
		return
	}

	// Retrieve the updated user from the database
	user, err := cfg.Db.GetUserByEmail(r.Context(), param.Email)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to retrieve updated user from database", err)
		return
	}


	// Respond with updated user info (excluding password)
	RespondWithJSON(w, http.StatusOK,response{
		User: User{
			ID : user.ID,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
			Email: user.Email,
		},
	} )
}
