package auth

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
)



func MakeRefreshToken()(string, error){
	// creating empty refresh token with length 32
	refreshToken := make([]byte, 32)

	// populating the refreshToken with random bits
	_, err := rand.Read(refreshToken)
	if err != nil{
		return "", fmt.Errorf("error creating the refresh token: %v", err)
	}

	return hex.EncodeToString(refreshToken), nil
}