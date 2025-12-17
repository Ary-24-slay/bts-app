// spotify-backend.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 4100;

// TODO: replace with env vars in production
const SPOTIFY_CLIENT_ID = 'cdb34e0585044cbe95cfefa3ef923bb0';
const SPOTIFY_CLIENT_SECRET = 'fdba9b12e1f3468798eedf4cfa301975';
const REDIRECT_URI = 'https://bts-trivia.vercel.app/';

const LASTFM_API_KEY = 'ed0d78983f52cfed3675b79f5ab4db15';

// Map moods to real Spotify playlist IDs
const MOOD_PLAYLISTS = {
  happy: '4fmxdvS2uQG8rjcrNyZsSt',
  sad: '7p8hvDQE0dwOh4NO2E5h6x',
  energetic: '2DUO7mJm8AUVkKqpyo9itz',
  anxious: '4r7mBgLPHa1AZZ9NWolUtT',
  calm: '20WSQLliEHcipckO9tj2bI'
};

app.use(cors());
app.use(express.json());

console.log('Loaded spotify-backend.js, defining routes...');

// Spotify auth callback → returns basic profile
app.post('/spotify/callback', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
  }

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(
            SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
          ).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      })
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error('Token error:', text);
      return res.status(500).json({ error: 'Token exchange failed' });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const meRes = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    });

    if (!meRes.ok) {
      const text = await meRes.text();
      console.error('Me error:', text);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    const profile = await meRes.json();

    return res.json({
      spotify_id: profile.id,
      display_name: profile.display_name || '',
      email: profile.email || ''
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Helper: app access token via client credentials
async function getAppAccessToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(
          SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
        ).toString('base64')
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials'
    })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('App token error:', text);
    throw new Error('Failed to get app token');
  }

  const data = await res.json();
  return data.access_token;
}

// Get one random track from a mood playlist
app.post('/spotify/random-track', async (req, res) => {
  const { mood } = req.body;
  const playlistId = MOOD_PLAYLISTS[mood] || MOOD_PLAYLISTS.calm;

  if (!playlistId) {
    return res.status(400).json({ error: 'Unknown mood' });
  }

  try {
    const accessToken = await getAppAccessToken();

    const tracksRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`,
      {
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      }
    );

    if (!tracksRes.ok) {
      const text = await tracksRes.text();
      console.error('Tracks error:', text);
      return res.status(500).json({ error: 'Failed to fetch playlist tracks' });
    }

    const tracksData = await tracksRes.json();
    const items = tracksData.items || [];

    const validTracks = items
      .map((item) => item.track)
      .filter((t) => t && t.id && t.type === 'track');

    if (validTracks.length === 0) {
      return res.status(404).json({ error: 'No tracks found in playlist' });
    }

    const randomIndex = Math.floor(Math.random() * validTracks.length);
    const track = validTracks[randomIndex];

    return res.json({
      id: track.id,
      name: track.name,
      artist: track.artists?.map((a) => a.name).join(', ') || 'Unknown artist',
      url: track.external_urls?.spotify || ''
    });
  } catch (err) {
    console.error('Random track error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Simple test route
app.post('/test', (req, res) => {
  console.log('POST /test hit');
  res.json({ ok: true });
});

// Last.fm BTS minutes for past 7 days
app.post('/lastfm/minutes', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Missing username' });
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const oneWeekAgo = now - 7 * 24 * 60 * 60;

    const tracksUrl = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(
      username
    )}&api_key=${LASTFM_API_KEY}&from=${oneWeekAgo}&to=${now}&limit=200&format=json`;

    const tracksRes = await fetch(tracksUrl);
    const tracksData = await tracksRes.json();

    if (!tracksData.recenttracks || !tracksData.recenttracks.track) {
      return res.json({ minutes: 0 });
    }

    const tracks = Array.isArray(tracksData.recenttracks.track)
      ? tracksData.recenttracks.track
      : [tracksData.recenttracks.track];

    const btsArtists = [
      'bts',
      'bangtan boys',
      'bulletproof boy scouts',
      'bt5',
      'bangtan sonyeondan',
      'j-hope',
      'jimin',
      'jin',
      'suga',
      'rm',
      'v',
      'jungkook',
      'agust d'
    ];

    let totalMs = 0;

    for (const track of tracks) {
      const artistName =
        (track.artist && track.artist['#text'])?.toLowerCase() || '';

      if (btsArtists.some((btsName) => artistName.includes(btsName))) {
        const durationMs = track.duration
          ? parseInt(track.duration, 10) * 1000
          : 210000;
        totalMs += durationMs;
      }
    }

    const totalMinutes = Math.floor(totalMs / 1000 / 60);

    const btsTracksCount = tracks.filter((track) =>
      btsArtists.some((btsName) =>
        ((track.artist && track.artist['#text']) || '')
          .toLowerCase()
          .includes(btsName)
      )
    ).length;

    return res.json({
      username,
      minutes: totalMinutes,
      tracks_analyzed: tracks.length,
      bts_tracks: btsTracksCount
    });
  } catch (err) {
    console.error('Last.fm error:', err);
    return res.status(500).json({ error: 'Failed to fetch Last.fm data' });
  }
});

app.listen(PORT, () => {
  console.log(`Spotify backend listening on http://127.0.0.1:${PORT}`);
});
