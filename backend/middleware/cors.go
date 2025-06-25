package middleware

import (
	"net/http"

	"github.com/rs/cors"
)

func CORS() func(http.Handler) http.Handler {
	return cors.New(cors.Options{
		AllowedOrigins: []string{"https://collabdoc.xyz","https://www.collabdoc.xyz"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}).Handler
}
