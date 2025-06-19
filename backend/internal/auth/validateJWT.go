package auth

import (
	"fmt"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)


// Check the validation of token and get the userID if valid
func ValidateJWT(tokenString string, secretToken string)(uuid.UUID, error){
	// parse the token using claims(tokenString, claims, keyFunc)
	token, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {return []byte(secretToken), nil} )
	if err != nil{
		return uuid.UUID{}, fmt.Errorf("error parsing the token with claims: %v", err)
	}

	// extract the claims and check validity of token and then extract the userID
	if claims, ok := token.Claims.(*jwt.RegisteredClaims); ok && token.Valid{
		// extract userID from the subject field in the cliams
		userID, err := uuid.Parse(claims.Subject)
		if err != nil{
			return uuid.UUID{}, fmt.Errorf("error parsing the userID string to the uuid format: %v", err)
		}
		return userID, nil
	}

	return uuid.UUID{}, fmt.Errorf("validation error: %v", err)
}