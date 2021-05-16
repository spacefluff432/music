// Get Access Token
var token = location.hash.split('access_token=')[1];

// Exist?
if (token) {

    // Spotify API
    var spotify = new SpotifyWebApi();
    spotify.setAccessToken(token.split('&')[0]);

    // Get Username
    spotify.getMe().then(a => {

        // Create Playlist
        spotify.createPlaylist(a.id, {
            name: 'MVT',
            description: 'A playlist of your most viewed tracks.'
        }).then(b => {

            // Get Tracks
            spotify.getMyTopTracks({
                limit: 49, time_range: 'long_term'
            }).then(c => {

                // Append Tracks to Playlist
                spotify.addTracksToPlaylist(a.id, b.id, c.items.map(c => c.uri));

                // Get More Tracks
                spotify.getMyTopTracks({
                    limit: 50, offset: 49, time_range: 'long_term'
                }).then(d => {

                    // Append More Tracks to Playlist
                    spotify.addTracksToPlaylist(a.id, b.id, d.items.map(d => d.uri)).then(e => {

                        // Close Window
                        window.close();
                    });
                });
            });
        });
    });
}

// Not Exist?
else {

    // Request Token (Open Window)
    setTimeout(() => window.open(`https://accounts.spotify.com/authorize?client_id=dbce8ee2743a46a2880a79a6e498d923&response_type=token&redirect_uri=${location.origin + location.pathname}&scope=user-top-read%20playlist-modify-public&show_dialog=true`), 1e4);
}