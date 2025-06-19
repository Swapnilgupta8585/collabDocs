package auth

import (
	"fmt"
	"net/http"
	"strings"
)

func GetBearerToken(header http.Header) (string, error) {
	// get the string of this format : Bearer <token_string> from the request header's Authorizaation.
	bearerTokenString := header.Get("Authorization")

	// if the format is not there respond with unauthorized error
	if bearerTokenString == "" || !strings.HasPrefix(bearerTokenString, "Bearer ") {
		return "", fmt.Errorf("invalid or missing Authorization header")
	}

	// split the string into parts of that we can get the token_string
	parts := strings.Split(bearerTokenString, " ")
	if len(parts) != 2 {
		return "", fmt.Errorf("malformed Authorization header")
	}

	// get the token_string
	tokenString := parts[1]

	// return tokenString(access token)
	return tokenString, nil

}
