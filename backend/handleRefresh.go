package main

import (
	"fmt"
	"net/http"

	"time"
	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	
)

// handleRefresh validates a refresh token and returns a new access token (JWT).
func (cfg *ApiConfig) handleRefresh(w http.ResponseWriter, r *http.Request){
	// Response payload
	type response struct{
		Token string `json:"token"`
	}

	// Extract refresh token from Authorization header (Bearer <token>).
	refreshToken, err := auth.GetBearerToken(r.Header)
	if err != nil{
		RespondWithError(w, http.StatusBadRequest, "Missing or invalid Authorization header", err)
		return
	}

	// Retrieve the refresh token record from the database.
	RefreshTokenFromDB, err := cfg.Db.GetRefreshTokenFromToken(r.Context(), refreshToken)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Invalid or unknown refresh token", err)
		return
	} 

	// Check if the token has expired.
	if time.Now().After(RefreshTokenFromDB.ExpiredAt){
		RespondWithError(w, http.StatusUnauthorized, "Refresh token has expired!", fmt.Errorf("refresh token has expired"))
		return
	}

	// Check if the refresh_token got revoked.
	if RefreshTokenFromDB.RevokedAt.Valid{
		RespondWithError(w, http.StatusUnauthorized, "Refresh token has been revoked!", fmt.Errorf("refresh token has been revoked"))
		return
	}

	// Retrieve the user associated with the refresh token.
	user, err := cfg.Db.GetUserFromRefreshToken(r.Context(), refreshToken)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch user from database", err)
	}

	// Generate a new JWT access token (valid for 1 hour).
	JWTtoken, err := auth.MakeJWT(user.UserID, cfg.SecretToken, 1 * time.Hour)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to generate access token", err)
		return
	}

	// Return the new access token.
	RespondWithJSON(w, http.StatusOK, response{Token: JWTtoken})
}