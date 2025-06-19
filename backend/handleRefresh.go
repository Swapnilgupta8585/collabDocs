package main

import (
	"fmt"
	"net/http"

	"time"
	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	
)

// handleRefresh uses the refresh token, if the refresh token hasn't expired or revoked and create a new JWTtoken(access token) 
func (cfg *ApiConfig) handleRefresh(w http.ResponseWriter, r *http.Request){
	// response struct
	type response struct{
		Token string `json:"token"`
	}

	// get the string of this format : Bearer <token_string> from the request header's Authorizaation.
	refreshToken, err := auth.GetBearerToken(r.Header)
	if err != nil{
		RespondWithError(w, http.StatusBadRequest, "Error getting refresh token from request header", err)
		return
	}

	// get the refresh_token details from the database using the token_string we got from request body
	RefreshTokenFromDB, err := cfg.Db.GetRefreshTokenFromToken(r.Context(), refreshToken)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorized User", err)
		return
	} 

	// check if the refresh_token got expired or not
	if time.Now().After(RefreshTokenFromDB.ExpiredAt){
		RespondWithError(w, http.StatusUnauthorized, "Refresh token has expired!", fmt.Errorf("refresh token has expired"))
		return
	}

	// check if the refresh_token got revoked or not
	if RefreshTokenFromDB.RevokedAt.Valid{
		RespondWithError(w, http.StatusUnauthorized, "Refresh token has been revoked!", fmt.Errorf("refresh token has been revoked"))
		return
	}

	// if not expired or revoked, get the user from database associated with the refresh_token using refresh token
	user, err := cfg.Db.GetUserFromRefreshToken(r.Context(), refreshToken)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Error getting the user from database", err)
	}

	// create JWTtoken(access token) with expiry of 1 hour in the exp(expiry) claim
	JWTtoken, err := auth.MakeJWT(user.UserID, cfg.SecretToken, 1 * time.Hour)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Error Creating JWTtoken", err)
		return
	}

	fmt.Println("refreshedddd your tokennn")
	// respond with JWTtoken in response json
	RespondWithJSON(w, http.StatusOK, response{Token: JWTtoken})
}