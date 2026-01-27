#!/bin/bash

BASE_URL="http://localhost:3000"

echo "Waiting for server to be ready..."
sleep 5

# 1. Register User 1
echo "Registering User 1..."
USER1_RES=$(curl -s -X POST $BASE_URL/auth/register -H "Content-Type: application/json" -d '{"name": "Alice", "email": "alice@example.com", "password": "password123"}')
echo $USER1_RES

# 2. Login User 1
echo "Logging in User 1..."
LOGIN_RES=$(curl -s -X POST $BASE_URL/auth/login -H "Content-Type: application/json" -d '{"email": "alice@example.com", "password": "password123"}')
TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

# 3. Create Post
echo "Creating Post..."
POST_RES=$(curl -s -X POST $BASE_URL/posts -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"title": "My First Cat Post", "content": "Cats are awesome!", "category": "Gatos"}')
echo $POST_RES
POST_ID=$(echo $POST_RES | grep -o '"id":[^,]*' | cut -d':' -f2)
echo "Post ID: $POST_ID"

# 4. Get All Posts
echo "Getting All Posts..."
curl -s $BASE_URL/posts | grep "My First Cat Post"

# 5. Add Comment
echo "Adding Comment..."
curl -s -X POST $BASE_URL/posts/$POST_ID/comments -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"content": "Great post!"}'

# 6. Get Comments
echo "Getting Comments..."
curl -s $BASE_URL/posts/$POST_ID/comments

# 7. Like Post
echo "Liking Post..."
curl -s -X POST $BASE_URL/posts/$POST_ID/like -H "Authorization: Bearer $TOKEN"

# 8. Get Likes
echo "Getting Likes..."
curl -s $BASE_URL/posts/$POST_ID/likes

echo "Verification Complete!"
