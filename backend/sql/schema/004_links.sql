
-- +goose Up
CREATE TABLE links(
    token TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    doc_id UUID NOT NULL REFERENCES docs(id) ON DELETE CASCADE,
    permission TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_links_doc_id ON links(doc_id);
CREATE INDEX idx_links_token ON links(token);


-- +goose Down
DROP TABLE links;