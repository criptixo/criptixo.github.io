# Deploying to Cloudflare Workers

## Overview
This is a Cloudflare Workers deployment of your website. Workers run on Cloudflare's edge network for fast global performance.

## Prerequisites
1. Cloudflare account
2. Domain name (either registered through Cloudflare or DNS pointed to Cloudflare)
3. Node.js and npm installed locally

## Setup Steps

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Create KV Namespaces
```bash
# Create visitor counter storage
wrangler kv:namespace create "VISITOR_COUNT"
wrangler kv:namespace create "VISITOR_COUNT" --preview

# Create messages storage
wrangler kv:namespace create "MESSAGES"
wrangler kv:namespace create "MESSAGES" --preview
```

### 4. Update wrangler.toml
After creating KV namespaces, update the `wrangler.toml` file with the IDs returned:

```toml
[[kv_namespaces]]
binding = "VISITOR_COUNT"
id = "your-visitor-count-id-here"
preview_id = "your-visitor-count-preview-id-here"

[[kv_namespaces]]
binding = "MESSAGES"
id = "your-messages-id-here"
preview_id = "your-messages-preview-id-here"
```

### 5. Configure Your Domain
Update the routes in `wrangler.toml` with your actual domain:

```toml
[[routes]]
pattern = "yourdomain.com/*"
zone_name = "yourdomain.com"
```

### 6. Deploy
```bash
# Preview your worker
wrangler dev

# Deploy to production
wrangler deploy
```

## Features Included

✅ **Static Site Serving**: Homepage and static pages  
✅ **API Endpoints**: Visitor counter, Last.fm integration, guestbook  
✅ **KV Storage**: Persistent data for visitors and messages  
✅ **Edge Performance**: Global CDN with sub-50ms response times  
✅ **Auto-scaling**: Handles traffic spikes automatically  

## Environment Variables
- `VISITOR_COUNT`: KV namespace for visitor counting
- `MESSAGES`: KV namespace for guestbook messages

## Custom Domain Setup

### Using Cloudflare DNS:
1. Add your domain to Cloudflare
2. Update nameservers to Cloudflare's
3. Add DNS records:
   - `A` record: `@` → `192.0.2.1` (proxied)
   - `CNAME` record: `www` → `yourdomain.com` (proxied)

### SSL/TLS:
Cloudflare provides automatic SSL certificates. Ensure SSL/TLS encryption mode is set to "Full" or "Full (strict)".

## Cost
- **Free Tier**: 100,000 requests/day
- **Paid Plan**: $5/month for 10 million requests
- **KV Storage**: 1GB free, then $0.50/GB

## Monitoring
Access logs and analytics through the Cloudflare dashboard at dash.cloudflare.com.

## Optimization Tips

1. **Cache Headers**: Static assets are automatically cached
2. **Compression**: Gzip/Brotli compression enabled by default
3. **Global Distribution**: Content served from 200+ edge locations
4. **Performance**: Sub-50ms response times globally

## Troubleshooting

### Common Issues:
- **KV Binding Errors**: Ensure KV namespace IDs are correct in wrangler.toml
- **Domain Not Working**: Check DNS settings and route patterns
- **API Errors**: Verify environment variables are set

### Debug Commands:
```bash
# View logs
wrangler tail

# Test locally
wrangler dev

# Check deployment status
wrangler deployments list
```

## Limitations

- **File System**: No local file system (content must be inline or in KV)
- **Real-time Features**: Socket.IO replaced with simple polling
- **Cold Starts**: Minimal (~1ms) but present for first request
- **Memory**: 128MB limit per request

## Migration Notes

The original Node.js/Express app has been adapted for the Workers runtime:
- Socket.IO → Simple HTTP polling
- File system → KV storage
- Server-side rendering → Edge-side rendering

This provides better performance and scalability while maintaining core functionality.
