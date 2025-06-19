package auth

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

// check whether the hash of the password is equal to the hash stored for the user in DB
func CheckHashPassword(password, hash string) error{
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		return fmt.Errorf("wrong password, hash not matched: %v", err)
	}
	return nil
}