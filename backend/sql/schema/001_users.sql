-- +goose Up
CREATE TABLE users(
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    email TEXT NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL
);

-- +goose Down
DROP TABLE users;