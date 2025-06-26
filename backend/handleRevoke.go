package main
import (
	"net/http"

	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	
)

// handleRevoke revokes a refresh token so it can no longer be used to generate access tokens.
func (cfg *ApiConfig) handleRevoke(w http.ResponseWriter, r *http.Request){
	// Extract the token from the Authorization header.
	refreshToken, err := auth.GetBearerToken(r.Header)
	if err != nil{
		RespondWithError(w, http.StatusBadRequest, "Missing or invalid Authorization header", err)
		return
	}

	// Retrieve token record from database.
	RefreshTokenFromDB, err := cfg.Db.GetRefreshTokenFromToken(r.Context(), refreshToken)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Invalid or expired refresh token", err)
		return
	}

	// Revoke the token by updating revoked_at and updated_at timestamps.
	err = cfg.Db.UpdateRevokedAtAndUpdateAt(r.Context(), RefreshTokenFromDB.RefreshToken)
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Failed to revoke refresh token in the database", err)
		return
	}
	
	// Respond with 204 No Content to indicate successful revocation.
    w.WriteHeader(http.StatusNoContent)
}