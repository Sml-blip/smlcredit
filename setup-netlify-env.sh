#!/bin/bash
# This script sets up the required Netlify environment variables
# Prerequisites: NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID should be set

NETLIFY_AUTH_TOKEN="${NETLIFY_AUTH_TOKEN:-}"
NETLIFY_SITE_ID="${NETLIFY_SITE_ID:-}"
DATABASE_URL="${NETLIFY_DATABASE_URL:-postgresql://neondb_owner:npg_NuDlHBFP3K2L@ep-lucky-cell-aeuo47hk-pooler.c-2.us-east-2.aws.neon.tech/smlcredit?sslmode=require&channel_binding=require}"
ADMIN_PIN="${ADMIN_PIN:-1234}"

if [ -z "$NETLIFY_AUTH_TOKEN" ] || [ -z "$NETLIFY_SITE_ID" ]; then
  echo "Error: NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID environment variables must be set"
  echo ""
  echo "To find your NETLIFY_SITE_ID, visit https://app.netlify.com and look for the site details"
  echo "To create a NETLIFY_AUTH_TOKEN, visit https://app.netlify.com/user/applications/personal"
  exit 1
fi

echo "Setting environment variables for Netlify site: $NETLIFY_SITE_ID"

# Set NETLIFY_DATABASE_URL
curl -X POST "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/builds/env" \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"key\":\"NETLIFY_DATABASE_URL\",\"values\":{\"production\":\"$DATABASE_URL\",\"branch-deploy\":\"$DATABASE_URL\",\"deploy-preview\":\"$DATABASE_URL\"}}"

echo ""
echo "Environment variables have been set successfully"
echo ""
echo "You can verify by visiting: https://app.netlify.com/sites/smlcredit/settings/build#environment-variables"
