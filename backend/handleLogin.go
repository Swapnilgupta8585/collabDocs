package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	"github.com/Swapnilgupta8585/collabDocs/internal/database"

)

// handleLogin authenticates a user and returns access and refresh tokens.
func (cfg *ApiConfig) handleLogin(w http.ResponseWriter, r *http.Request){

	// Expected request body.
	type parameter struct{
		Email string `json:"email"`
		Password string `json:"password"`
		
	}

	// Response struct
	type response struct{
		User User  `json:"user"`
		Token string `json:"token"`
		RefreshToken string`json:"refresh_token"`

	}

	// Decode JSON body.
	reqParam := parameter{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&reqParam)
	if err != nil{
		RespondWithError(w, http.StatusBadRequest, "Invalid JSON format. Provide email and password.", err)
		return
	}

	// Fetch user by email.
	user, err := cfg.Db.GetUserByEmail(r.Context(), reqParam.Email)
	if err != nil{
		RespondWithError(w, http.StatusNotFound, "User with provided email not found", err)
		return
	}

	// Verify password.
	err = auth.CheckHashPassword(reqParam.Password, user.HashedPassword)
	if err != nil{
		RespondWithError(w, http.StatusUnauthorized, "Incorrect email or password", err)
		return
	}

	// Generate access token (valid for 1 hour).
	accessToken, err := auth.MakeJWT(user.ID, cfg.SecretToken, 1 * time.Hour)
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Failed to generate access token", err)
		return
	}

	// Generate refresh token (valid for 60 days).
	refreshToken, err := auth.MakeRefreshToken()
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to generate refresh token", err)
		return
	}

	// Store refresh token in the database.
	refreshTokenFromDB, err := cfg.Db.CreateRefreshToken(r.Context(), database.CreateRefreshTokenParams{RefreshToken: refreshToken, UserID: user.ID, ExpiredAt: time.Now().Add(60*24*time.Hour)})
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to save refresh token to the database", err)
		return
	}
	
	// Respond with user info and tokens.
	RespondWithJSON(w, http.StatusOK, response{
		User: User{
			ID: user.ID,
			FullName: user.FullName,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
			Email: user.Email,
		},
		Token: accessToken,
		RefreshToken: refreshTokenFromDB.RefreshToken,
	})

}