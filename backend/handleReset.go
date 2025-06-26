package main

import (
	"net/http"
	"os"

)


// handleReset deletes all users in the database — only allowed in a dev environment.
func (cfg *ApiConfig) handleReset(w http.ResponseWriter, r *http.Request){

	// Protect against accidental use in non-dev environments.
	if os.Getenv("PLATFORM") != "dev"{
		RespondWithError(w, http.StatusForbidden, "Access denied: Not allowed in this environment", nil)
		return
	}

	// Attempt to delete all users.
	err := cfg.Db.DeleteAllUser(r.Context())
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to delete users from the database", err)
		return
	}

	// response body
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("All users deleted successfully"))
}