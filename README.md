# Songrunner

To use this you're going to need a Spotify Account, it probably needs to be premium, i haven't tested
with a free version. I suspect it won't have the scope to create playlists.

1. Npm install 
2. Config your .env file (you're going to put it in the server folder next to index) ***
3. Spin up server (call node on index.js)
4. Spin up frontend (npm run dev)

*** 
# .env
The .env file needs three things;
SPOTIFY_CLIENT_ID= ?????
SPOTIFY_CLIENT_SECRET= ?????
REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback 
you'll need to go to https://developer.spotify.com/
and set up your dev account to make a client ID and Secret,
just slot them in there when you are done.