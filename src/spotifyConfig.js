// src/spotifyConfig.js
const SPOTIFY_CLIENT_ID = 'cdb34e0585044cbe95cfefa3ef923bb0';
const SPOTIFY_REDIRECT_URI = 'https://bts-trivia.vercel.app/';
const SPOTIFY_SCOPES = [
  'user-read-recently-played',
  'user-top-read'
].join(' ');

// spotifyConfig.js (replace only the getSpotifyAuthUrl function)

export function getSpotifyAuthUrl() {
  const params = [
    `client_id=${encodeURIComponent(SPOTIFY_CLIENT_ID)}`,
    `response_type=code`,  // changed from token → code
    `redirect_uri=${encodeURIComponent('https://bts-trivia.vercel.app/')}`,
    `scope=${encodeURIComponent(SPOTIFY_SCOPES)}`
  ].join("&");

  const finalUrl = `https://accounts.spotify.com/authorize?${params}`;
  console.log("FINAL Spotify URL:", finalUrl);
  return finalUrl;
}


