package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	"github.com/Swapnilgupta8585/collabDocs/internal/database"

)


func (cfg *ApiConfig) handleLogin(w http.ResponseWriter, r *http.Request){

	// request body
	type parameter struct{
		Email string `json:"email"`
		Password string `json:"password"`
		
	}

	// response payload
	type response struct{
		User User  `json:"user"`
		Token string `json:"token"`
		RefreshToken string`json:"refresh_token"`

	}

	// decode the request body
	reqParam := parameter{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&reqParam)
	if err != nil{
		RespondWithError(w, http.StatusBadRequest, "Invalid request format. Ensure email and password are provided.", err)
		return
	}

	// get user by email
	user, err := cfg.Db.GetUserByEmail(r.Context(), reqParam.Email)
	if err != nil{
		RespondWithError(w, http.StatusNotFound, "No user found with the provided email", err)
		return
	}

	// check authentication of the user
	err = auth.CheckHashPassword(reqParam.Password, user.HashedPassword)
	if err != nil{
		RespondWithError(w, http.StatusUnauthorized, "Incorrect email or password", err)
		return
	}

	// create accessToken
	accessToken, err := auth.MakeJWT(user.ID, cfg.SecretToken, 1 * time.Hour)
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Failed to generate access token", err)
		return
	}

	// create refreshToken
	refreshToken, err := auth.MakeRefreshToken()
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to generate refresh token", err)
		return
	}

	// store the refresh token in the database, expires in 60 days
	refreshTokenFromDB, err := cfg.Db.CreateRefreshToken(r.Context(), database.CreateRefreshTokenParams{RefreshToken: refreshToken, UserID: user.ID, ExpiredAt: time.Now().Add(60*24*time.Hour)})
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to save refresh token to the database", err)
		return
	}
	
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