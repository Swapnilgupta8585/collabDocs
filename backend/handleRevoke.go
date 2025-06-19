package main
import (
	"net/http"

	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	
)

// handles POST /api/revoke path, handleRevoke revokes the refresh token so that it can not be used anymore to create or refresh new access tokens for authentication
func (cfg *ApiConfig) handleRevoke(w http.ResponseWriter, r *http.Request){
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

	// update the refresh_token parametrs revoked_at and updated_at time.Now()
	err = cfg.Db.UpdateRevokedAtAndUpdateAt(r.Context(), RefreshTokenFromDB.RefreshToken)
	if err != nil{
		RespondWithError(w, http.StatusInternalServerError, "Couldn't Update the revoked_at and update_at in the database for the refresh token", err)
		return
	}
	
	// set the status code without writing any response body
    w.WriteHeader(http.StatusNoContent)
}