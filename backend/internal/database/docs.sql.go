// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: docs.sql

package database

import (
	"context"

	"github.com/google/uuid"
)

const createDoc = `-- name: CreateDoc :one
INSERT INTO docs(
    id,
    doc_name,
    created_at,
    updated_at,
    user_id,
    content
)VALUES(
    gen_random_uuid(),
    $1,
    NOW(),
    NOW(),
    $2,
    $3
)
RETURNING id, doc_name, created_at, updated_at, user_id, content
`

type CreateDocParams struct {
	DocName string
	UserID  uuid.UUID
	Content string
}

func (q *Queries) CreateDoc(ctx context.Context, arg CreateDocParams) (Doc, error) {
	row := q.db.QueryRowContext(ctx, createDoc, arg.DocName, arg.UserID, arg.Content)
	var i Doc
	err := row.Scan(
		&i.ID,
		&i.DocName,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.UserID,
		&i.Content,
	)
	return i, err
}

const deleteDocByID = `-- name: DeleteDocByID :exec
DELETE FROM docs
WHERE id=$1
`

func (q *Queries) DeleteDocByID(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.ExecContext(ctx, deleteDocByID, id)
	return err
}

const getDocByID = `-- name: GetDocByID :one
SELECT id, doc_name, created_at, updated_at, user_id, content FROM docs
WHERE id=$1
`

func (q *Queries) GetDocByID(ctx context.Context, id uuid.UUID) (Doc, error) {
	row := q.db.QueryRowContext(ctx, getDocByID, id)
	var i Doc
	err := row.Scan(
		&i.ID,
		&i.DocName,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.UserID,
		&i.Content,
	)
	return i, err
}

const getDocsByUserID = `-- name: GetDocsByUserID :many
SELECT id, doc_name, created_at, updated_at, user_id, content FROM docs
WHERE user_id=$1
`

func (q *Queries) GetDocsByUserID(ctx context.Context, userID uuid.UUID) ([]Doc, error) {
	rows, err := q.db.QueryContext(ctx, getDocsByUserID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Doc
	for rows.Next() {
		var i Doc
		if err := rows.Scan(
			&i.ID,
			&i.DocName,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.UserID,
			&i.Content,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateContent = `-- name: UpdateContent :exec
UPDATE docs
SET content=$1, updated_at=NOW()
WHERE id=$2
`

type UpdateContentParams struct {
	Content string
	ID      uuid.UUID
}

func (q *Queries) UpdateContent(ctx context.Context, arg UpdateContentParams) error {
	_, err := q.db.ExecContext(ctx, updateContent, arg.Content, arg.ID)
	return err
}
