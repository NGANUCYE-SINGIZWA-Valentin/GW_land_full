// src/utils/oauth.js
//
// Minimal "Authorization Code" OAuth2 flow for Google and Facebook —
// no extra dependencies, just fetch (built into Node 18+).
//
// Both providers follow the same shape:
//   1. buildXAuthUrl(state)      -> where to send the browser
//   2. exchangeXCode(code)       -> authorization code -> access token
//   3. fetchXProfile(token)      -> access token -> { id, email, name, picture }
//
// Requires these vars in .env (see .env.example):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
//   FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_CALLBACK_URL

function buildGoogleAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeGoogleCode(code) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code',
      code,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || 'Google token exchange failed');
  return data.access_token;
}

async function fetchGoogleProfile(accessToken) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to fetch Google profile');
  return { id: data.sub, email: data.email, name: data.name, picture: data.picture };
}

function buildFacebookAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID,
    redirect_uri: process.env.FACEBOOK_CALLBACK_URL,
    response_type: 'code',
    scope: 'email,public_profile',
    state,
  });
  return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
}

async function exchangeFacebookCode(code) {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID,
    client_secret: process.env.FACEBOOK_APP_SECRET,
    redirect_uri: process.env.FACEBOOK_CALLBACK_URL,
    code,
  });
  const res = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Facebook token exchange failed');
  return data.access_token;
}

async function fetchFacebookProfile(accessToken) {
  const params = new URLSearchParams({ fields: 'id,name,email,picture.type(large)', access_token: accessToken });
  const res = await fetch(`https://graph.facebook.com/me?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to fetch Facebook profile');
  return { id: data.id, email: data.email, name: data.name, picture: data.picture?.data?.url };
}

module.exports = {
  buildGoogleAuthUrl,
  exchangeGoogleCode,
  fetchGoogleProfile,
  buildFacebookAuthUrl,
  exchangeFacebookCode,
  fetchFacebookProfile,
};
