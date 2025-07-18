// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: refresh_token.sql

package database

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

const createRefreshToken = `-- name: CreateRefreshToken :one
INSERT INTO refresh_tokens(
    refresh_token,
    created_at, 
    updated_at, 
    user_id, 
    expired_at, 
    revoked_at
)
VALUES(
    $1,
    NOW(),
    NOW(),
    $2,
    $3,
    NULL
)
RETURNING refresh_token, created_at, updated_at, user_id, expired_at, revoked_at
`

type CreateRefreshTokenParams struct {
	RefreshToken string
	UserID       uuid.UUID
	ExpiredAt    time.Time
}

func (q *Queries) CreateRefreshToken(ctx context.Context, arg CreateRefreshTokenParams) (RefreshToken, error) {
	row := q.db.QueryRowContext(ctx, createRefreshToken, arg.RefreshToken, arg.UserID, arg.ExpiredAt)
	var i RefreshToken
	err := row.Scan(
		&i.RefreshToken,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.UserID,
		&i.ExpiredAt,
		&i.RevokedAt,
	)
	return i, err
}

const getRefreshTokenFromToken = `-- name: GetRefreshTokenFromToken :one
SELECT refresh_token, created_at, updated_at, user_id, expired_at, revoked_at FROM refresh_tokens
WHERE refresh_token=$1
`

func (q *Queries) GetRefreshTokenFromToken(ctx context.Context, refreshToken string) (RefreshToken, error) {
	row := q.db.QueryRowContext(ctx, getRefreshTokenFromToken, refreshToken)
	var i RefreshToken
	err := row.Scan(
		&i.RefreshToken,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.UserID,
		&i.ExpiredAt,
		&i.RevokedAt,
	)
	return i, err
}

const getUserFromRefreshToken = `-- name: GetUserFromRefreshToken :one
SELECT id, full_name, users.created_at, users.updated_at, email, hashed_password, refresh_token, refresh_tokens.created_at, refresh_tokens.updated_at, user_id, expired_at, revoked_at FROM users 
INNER JOIN refresh_tokens
ON users.id = refresh_tokens.user_id
WHERE refresh_tokens.refresh_token = $1
AND refresh_tokens.expired_at > NOW()
AND refresh_tokens.revoked_at IS NULL
`

type GetUserFromRefreshTokenRow struct {
	ID             uuid.UUID
	FullName       string
	CreatedAt      time.Time
	UpdatedAt      time.Time
	Email          string
	HashedPassword string
	RefreshToken   string
	CreatedAt_2    time.Time
	UpdatedAt_2    time.Time
	UserID         uuid.UUID
	ExpiredAt      time.Time
	RevokedAt      sql.NullTime
}

func (q *Queries) GetUserFromRefreshToken(ctx context.Context, refreshToken string) (GetUserFromRefreshTokenRow, error) {
	row := q.db.QueryRowContext(ctx, getUserFromRefreshToken, refreshToken)
	var i GetUserFromRefreshTokenRow
	err := row.Scan(
		&i.ID,
		&i.FullName,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.Email,
		&i.HashedPassword,
		&i.RefreshToken,
		&i.CreatedAt_2,
		&i.UpdatedAt_2,
		&i.UserID,
		&i.ExpiredAt,
		&i.RevokedAt,
	)
	return i, err
}

const updateRevokedAtAndUpdateAt = `-- name: UpdateRevokedAtAndUpdateAt :exec
UPDATE refresh_tokens
SET revoked_at = NOW(), updated_at = NOW()
WHERE refresh_token = $1
`

func (q *Queries) UpdateRevokedAtAndUpdateAt(ctx context.Context, refreshToken string) error {
	_, err := q.db.ExecContext(ctx, updateRevokedAtAndUpdateAt, refreshToken)
	return err
}
