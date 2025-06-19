package main

import (
	"fmt"
	"net/http"
	"os"

)



func (cfg *ApiConfig) handleReset(w http.ResponseWriter, r *http.Request){

	// dangerous endpoints should only be accessed in a local environment
	if os.Getenv("PLATFORM") != "dev"{
		RespondWithError(w, http.StatusForbidden, "No permission", nil)
		return
	}

	// Delete all users from the database
	err := cfg.Db.DeleteAllUser(r.Context())
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Error deleting the users from the DB", err)
		return
	}
	fmt.Println("Deleted All users From the Database Successfully!")

	// response body
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Deleted all the users successfully"))
}