
-- +goose Up
CREATE TABLE docs(
    id UUID PRIMARY KEY,
    doc_name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL
);

-- +goose Down
DROP TABLE docs;