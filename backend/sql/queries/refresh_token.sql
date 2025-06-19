
-- name: CreateRefreshToken :one
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
RETURNING *;

-- name: GetRefreshTokenFromToken :one
SELECT * FROM refresh_tokens
WHERE refresh_token=$1;

-- name: GetUserFromRefreshToken :one
SELECT * FROM users 
INNER JOIN refresh_tokens
ON users.id = refresh_tokens.user_id
WHERE refresh_tokens.refresh_token = $1
AND refresh_tokens.expired_at > NOW()
AND refresh_tokens.revoked_at IS NULL;

-- name: UpdateRevokedAtAndUpdateAt :exec
UPDATE refresh_tokens
SET revoked_at = NOW(), updated_at = NOW()
WHERE refresh_token = $1;