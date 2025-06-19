package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// Create a JWT token
func MakeJWT(userID uuid.UUID, secretToken string, expiresIn time.Duration)(string, error){
	now := time.Now()

	// create claims with appropriate params
	claims := jwt.RegisteredClaims{
		Issuer: "CollabDocs",
		IssuedAt: jwt.NewNumericDate(now.UTC()),
		ExpiresAt: jwt.NewNumericDate(now.Add(expiresIn).UTC()),
		Subject: userID.String(),
	}

	// Create the JWT token
	JWTtoken:= jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// sign the token with secretToken
	signedToken, err := JWTtoken.SignedString([]byte(secretToken))
	if err != nil{
		return "", fmt.Errorf("error signing the jwtToken with the secret key: %v", err)
	}

	return signedToken, nil
}
