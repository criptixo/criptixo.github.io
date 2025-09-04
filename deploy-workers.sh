#!/bin/bash

# Cloudflare Workers Deployment Script
# This script automates the deployment of criptixo.me to Cloudflare Workers

set -e

echo "🚀 Deploying criptixo.me to Cloudflare Workers..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please login to Cloudflare..."
    wrangler login
fi

# Create KV namespaces if they don't exist
echo "📦 Setting up KV namespaces..."

# Check if namespaces exist, create if they don't
if ! wrangler kv:namespace list | grep -q "VISITOR_COUNT"; then
    echo "Creating VISITOR_COUNT namespace..."
    VISITOR_NS=$(wrangler kv:namespace create "VISITOR_COUNT" --output json | jq -r '.id')
    VISITOR_PREVIEW_NS=$(wrangler kv:namespace create "VISITOR_COUNT" --preview --output json | jq -r '.id')
    echo "VISITOR_COUNT namespace created: $VISITOR_NS"
fi

if ! wrangler kv:namespace list | grep -q "MESSAGES"; then
    echo "Creating MESSAGES namespace..."
    MESSAGES_NS=$(wrangler kv:namespace create "MESSAGES" --output json | jq -r '.id')
    MESSAGES_PREVIEW_NS=$(wrangler kv:namespace create "MESSAGES" --preview --output json | jq -r '.id')
    echo "MESSAGES namespace created: $MESSAGES_NS"
fi

# Initialize empty data if needed
echo "🗄️  Initializing data..."
wrangler kv:key put --binding=VISITOR_COUNT "count" "0" || true
wrangler kv:key put --binding=MESSAGES "messages" "[]" || true

# Validate the worker
echo "✅ Validating worker code..."
if ! node -c worker.js; then
    echo "❌ Worker validation failed"
    exit 1
fi

# Deploy to staging first
echo "🧪 Deploying to staging..."
wrangler deploy --env staging || echo "⚠️  Staging deployment optional"

# Deploy to production
echo "🌍 Deploying to production..."
wrangler deploy

# Test the deployment
echo "🔍 Testing deployment..."
WORKER_URL=$(wrangler deployments list --json | jq -r '.[0].url' 2>/dev/null || echo "")

if [ -n "$WORKER_URL" ]; then
    echo "Testing $WORKER_URL"
    if curl -s -f "$WORKER_URL" > /dev/null; then
        echo "✅ Deployment successful!"
        echo "🌐 Your site is live at: $WORKER_URL"
    else
        echo "⚠️  Deployment completed but site might not be responding yet"
    fi
else
    echo "✅ Deployment completed!"
fi

# Show next steps
echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Configure your custom domain in Cloudflare dashboard"
echo "2. Update DNS records to point to Cloudflare"
echo "3. Set up SSL/TLS encryption"
echo ""
echo "Useful commands:"
echo "- View logs: wrangler tail"
echo "- Test locally: wrangler dev"
echo "- Update deployment: wrangler deploy"
echo ""
echo "📊 Monitor your Worker at: https://dash.cloudflare.com"
