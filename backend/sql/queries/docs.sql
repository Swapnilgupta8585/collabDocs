
-- name: CreateDoc :one
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
RETURNING *;

-- name: GetDocByID :one
SELECT * FROM docs
WHERE id=$1;

-- name: UpdateContent :exec
UPDATE docs
SET content=$1, updated_at=NOW()
WHERE id=$2;

-- name: DeleteDocByID :exec
DELETE FROM docs
WHERE id=$1;

-- name: GetDocsByUserID :many
SELECT * FROM docs
WHERE user_id=$1;