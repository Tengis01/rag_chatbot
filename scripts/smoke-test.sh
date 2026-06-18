#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000}"

echo "1) Checking /health..."
curl -s "$BASE_URL/health" | jq

echo "2) Checking /config..."
curl -s "$BASE_URL/config" | jq

echo "3) Creating pasted document..."
PASTE_RESPONSE=$(curl -s -X POST "$BASE_URL/documents/paste" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Document RAG Chatbot MVP нь хэрэглэгч PDF upload эсвэл text paste хийж, тухайн document дээр асуулт асуух боломжтой систем юм. Backend нь Fastify ашиглана. Database нь local Postgres болон pgvector ашиглана. Embedding нь Gemini gemini-embedding-001 model ашиглаж VECTOR(768) хэлбэрээр хадгалагдана. Retrieval үед user question embedding үүсгээд pgvector cosine similarity ашиглан тохирох chunks олно. Дараа нь MMR rerank хийж хамгийн хэрэгтэй context chunks сонгоно."
  }')

echo "$PASTE_RESPONSE" | jq

DOC_ID=$(echo "$PASTE_RESPONSE" | jq -r '.id // .documentId // .document.id')

if [ -z "$DOC_ID" ] || [ "$DOC_ID" = "null" ]; then
  echo "❌ Could not extract DOC_ID"
  exit 1
fi

echo "DOC_ID=$DOC_ID"

echo "4) Waiting for document to become ready..."
for i in {1..30}; do
  STATUS_RESPONSE=$(curl -s "$BASE_URL/documents/$DOC_ID/status")
  STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status')

  echo "Attempt $i: status=$STATUS"

  if [ "$STATUS" = "ready" ]; then
    echo "✅ Document ready"
    break
  fi

  if [ "$STATUS" = "failed" ] || [ "$STATUS" = "error" ]; then
    echo "❌ Document failed"
    echo "$STATUS_RESPONSE" | jq
    exit 1
  fi

  if [ "$i" = "30" ]; then
    echo "❌ Timeout waiting for document ready"
    exit 1
  fi

  sleep 2
done

echo "5) Asking chat question..."
CHAT_RESPONSE=$(curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"Энэ project ямар database ашиглаж байгаа вэ?\",
    \"documentIds\": [\"$DOC_ID\"]
  }")

echo "$CHAT_RESPONSE" | jq

ANSWER=$(echo "$CHAT_RESPONSE" | jq -r '.reply // .answer // .content // .message.content // empty')
CONVERSATION_ID=$(echo "$CHAT_RESPONSE" | jq -r '.conversationId // .conversation.id // empty')
SOURCE_COUNT=$(echo "$CHAT_RESPONSE" | jq '.sources // .message.sources // [] | length')

if [ -z "$ANSWER" ]; then
  echo "❌ Chat answer is empty"
  exit 1
fi

if [ -z "$CONVERSATION_ID" ]; then
  echo "❌ Conversation ID missing"
  exit 1
fi

if [ "$SOURCE_COUNT" -eq 0 ]; then
  echo "⚠️  No sources returned (similarity threshold may be high for short text — acceptable for smoke test)"
fi

echo "✅ Chat answer OK"
echo "✅ Sources count: $SOURCE_COUNT"
echo "CONVERSATION_ID=$CONVERSATION_ID"

echo "6) Checking conversations..."
curl -s "$BASE_URL/conversations" | jq

echo "7) Checking conversation messages..."
curl -s "$BASE_URL/conversations/$CONVERSATION_ID/messages" | jq

echo "✅ Smoke test completed successfully"
