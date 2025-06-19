package auth

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

// generating a hash password
func HashPassword(password string) (string, error){
	// use bcrypt package to generate a hash password with defaultCost
	hashed_passwd, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil{
		return "", fmt.Errorf("error creating hash password: %v", err)
	}

	return string(hashed_passwd), nil
}