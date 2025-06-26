package main

import (
	"encoding/json"

	"net/http"
	"time"


	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	"github.com/Swapnilgupta8585/collabDocs/internal/database"
	"github.com/google/uuid"
)

// User represents a user account.
type User struct {
	ID        uuid.UUID `json:"id"`
	FullName  string    `json:"full_name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Email     string    `json:"email"`
	Password  string    `json:"-"` // Excluded from JSON responses
}

// handleCreateUsers registers a new user and stores their hashed password securely.
func (cfg *ApiConfig) handleCreateUsers(w http.ResponseWriter, r *http.Request) {

	// Define the expected JSON request body.
	type parameter struct {
		FullName string `json:"full_name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		
	}

	// Define the structure of the JSON response.
	type response struct {
		User User `json:"user"`
	}

	// Decode the JSON request body into the parameter struct.
	reqParam := parameter{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&reqParam)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Malformed JSON in request body", err)
		return
	}

	// Hash the user's password before storing it.
	hashedPassword, err := auth.HashPassword(reqParam.Password)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to hash password", err)
		return
	}

	// Insert the new user into the database.
	user, err := cfg.Db.CreateUser(r.Context(), database.CreateUserParams{
		FullName:       reqParam.FullName,
		Email:          reqParam.Email,
		HashedPassword: hashedPassword,
	})
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Error Creating User in the DB", err)
		return
	}

	// Return the newly created user (without the password).
	RespondWithJSON(w, http.StatusCreated, response{User: User{
		ID:        user.ID,
		FullName:  user.FullName,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
		Email:     user.Email,
	}})

}
