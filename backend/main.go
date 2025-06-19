package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"github.com/Swapnilgupta8585/collabDocs/internal/database"
	"github.com/Swapnilgupta8585/collabDocs/middleware"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type ApiConfig struct{
	Db *database.Queries
	SecretToken string
}

func main() {

	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Get port from environment variable
	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("PORT is not set")
	}

	// Get database URL from environment variable
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatal("DB_URL is not set")
	}

	// Connect to database
	dbConn, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}
	defer dbConn.Close()

	// Test database connection
	err = dbConn.Ping()
	if err != nil {
		log.Fatal("Error pinging database:", err)
	}

	fmt.Println("Connected to database")

	// create database query
	dbQueries := database.New(dbConn)

	// create apiconfig to handle state of the program
	cfg := ApiConfig{
		Db: dbQueries,
		SecretToken:os.Getenv("SECRET_TOKEN"),
	}

	// Create a multiplexer
	mux := http.NewServeMux()


	// Register routes
	mux.HandleFunc("GET /api/healthz", handleHealth)
	mux.HandleFunc("DELETE /admin/reset", cfg.handleReset)

	mux.HandleFunc("POST /api/users", cfg.handleCreateUsers)
	mux.HandleFunc("POST /api/login", cfg.handleLogin)
	mux.HandleFunc("PUT /api/users", cfg.handleUpdateUserCredentials)


	mux.HandleFunc("POST /api/refresh", cfg.handleRefresh)
	mux.HandleFunc("POST /api/revoke", cfg.handleRevoke)
	
	mux.HandleFunc("POST /api/docs", cfg.handleCreateDocs)
	mux.HandleFunc("GET /api/docs", cfg.handleGetDocsForUser)
	mux.HandleFunc("GET /api/docs/{DocID}", cfg.handleGetDocs)
	mux.HandleFunc("PUT /api/docs/{DocID}", cfg.handleUpdateDocs)
	mux.HandleFunc("DELETE /api/docs/{DocID}", cfg.handleDeleteDocs)

	mux.HandleFunc("POST /api/docs/share", cfg.handleDocShare)
	mux.HandleFunc("POST /api/resolveToken", cfg.handleResolveToken)


	//add cors using cors middleware
	handlerWithCORS := middleware.CORS()(mux)

	// Create a server
	server := &http.Server{
		Addr: fmt.Sprintf(":%s", port),
		Handler: handlerWithCORS,
	}

	// Start the server
	log.Printf("Starting server on port %s", port)
	err = server.ListenAndServe()
	log.Fatal(err)

}


