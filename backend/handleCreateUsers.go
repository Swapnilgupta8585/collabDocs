package main

import (
	"encoding/json"

	"net/http"
	"time"


	"github.com/Swapnilgupta8585/collabDocs/internal/auth"
	"github.com/Swapnilgupta8585/collabDocs/internal/database"
	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `json:"id"`
	FullName  string    `json:"full_name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`
}


func (cfg *ApiConfig) handleCreateUsers(w http.ResponseWriter, r *http.Request) {

	// request paramter
	type parameter struct {
		FullName string `json:"full_name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		
	}

	// response payload
	type response struct {
		User User `json:"user"`
	}

	// decode the request body
	reqParam := parameter{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&reqParam)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid JSON. Please check the request body format.", err)
		return
	}

	// create a hash password for the given password
	hashedPassword, err := auth.HashPassword(reqParam.Password)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to securely hash the password", err)
		return
	}

	// create user in the database
	user, err := cfg.Db.CreateUser(r.Context(), database.CreateUserParams{
		FullName:       reqParam.FullName,
		Email:          reqParam.Email,
		HashedPassword: hashedPassword,
	})
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Error Creating User in the DB", err)
		return
	}

	//respond with user(withour hash password ofcourse)
	RespondWithJSON(w, http.StatusCreated, response{User: User{
		ID:        user.ID,
		FullName:  user.FullName,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
		Email:     user.Email,
	}})

}
