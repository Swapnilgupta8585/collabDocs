
-- name: CreateUser :one
INSERT INTO users(id, full_name, created_at, updated_at, email, hashed_password)
VALUES(
    gen_random_uuid(),
    $1,
    NOW(),
    NOW(),
    $2,
    $3
)
RETURNING *;

-- name: AddHashPassword :exec
UPDATE users
SET hashed_password=$1, updated_at = NOW()
WHERE id=$2;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email=$1;


-- name: DeleteAllUser :exec
DELETE FROM users;

-- name: UpdateEmailOfUser :exec
UPDATE users
SET email=$1, updated_at=NOW()  
WHERE id=$2;