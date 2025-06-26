package middleware

import (
	"net/http"

	"github.com/rs/cors"
)

func CORS() func(http.Handler) http.Handler {
	return cors.New(cors.Options{
		AllowedOrigins: []string{"https://collabdoc.xyz","https://www.collabdoc.xyz", "https://collab-docs-nine.vercel.app", "http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}).Handler
}
