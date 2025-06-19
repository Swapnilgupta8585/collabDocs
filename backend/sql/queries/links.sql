
-- name: CreateLink :one
INSERT INTO links(
    token,
    created_at,
    updated_at,
    doc_id,
    permission,
    expires_at
)VALUES(
    $1,
    NOW(),
    NOW(),
    $2,
    $3,
    $4
)
RETURNING *;


-- name: GetDocInfoFromToken :one
SELECT docs.id, docs.content, links.permission FROM links
JOIN docs ON links.doc_id = docs.id
WHERE links.token=$1 AND links.expires_at > NOW();