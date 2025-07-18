const axios = require('axios');

process.env['SPOTIFY_CLIENT_ID'] = '4c4fc8c3496243cbba99b39826e2841f';
process.env['SPOTIFY_CLIENT_SECRET'] = 'd598f89aba0946e2b85fb8aefa9ae4c8';

function convert(ms) {
  var minutes = Math.floor(ms / 60000);
  var seconds = ((ms % 60000) / 1000).toFixed(0);
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

function spotifyCreds() {
  return new Promise((resolve, reject) => {
    axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
      headers: {
        Authorization: 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
      }
    })
      .then(response => {
        if (!response.data.access_token) {
          resolve({
            creator: 'Budy x creator ',
            status: false,
            msg: 'Can\'t generate token!'
          });
        } else {
          resolve({
            creator: 'Budy x creator ',
            status: true,
            data: response.data
          });
        }
      })
      .catch(error => {
        resolve({
          creator: 'Budy x creator ',
          status: false,
          msg: error.message
        });
      });
  });
}

function getInfo(url) {
  return new Promise((resolve, reject) => {
    spotifyCreds().then(creds => {
      if (!creds.status) {
        resolve(creds);
      } else {
        axios.get('https://api.spotify.com/v1/tracks/' + url.split('track/')[1], {
          headers: {
            Authorization: 'Bearer ' + creds.data.access_token
          }
        })
          .then(response => {
            resolve({
              creator: 'Budy x creator ',
              status: true,
              data: {
                thumbnail: response.data.album.images[0].url,
                title: response.data.artists[0].name + ' - ' + response.data.name,
                artist: response.data.artists[0],
                duration: convert(response.data.duration_ms),
                preview: response.data.preview_url
              }
            });
          })
          .catch(error => {
            resolve({
              creator: 'Budy x creator ',
              status: false,
              msg: error.message
            });
          });
      }
    });
  });
}

function searching(query, type = 'track', limit = 20) {
  return new Promise((resolve, reject) => {
    spotifyCreds().then(creds => {
      if (!creds.status) {
        resolve(creds);
      } else {
        axios.get('https://api.spotify.com/v1/search?query=' + query + '&type=' + type + '&offset=0&limit=' + limit, {
          headers: {
            Authorization: 'Bearer ' + creds.data.access_token
          }
        })
          .then(response => {
            if (!response.data.tracks.items || response.data.tracks.items.length < 1) {
              resolve({
                creator: 'Budy x creator ',
                status: false,
                msg: 'Music not found!'
              });
            } else {
              let data = [];
              response.data.tracks.items.map(v => data.push({
                title: v.album.artists[0].name + ' - ' + v.name,
                duration: convert(v.duration_ms),
                popularity: v.popularity + '%',
                preview: v.preview_url,
                url: v.external_urls.spotify
              }));
              resolve({
                creator: 'Budy x creator ',
                status: true,
                data
              });
            }
          })
          .catch(error => {
            resolve({
              creator: 'Budy x creator ',
              status: false,
              msg: error.message
            });
          });
      }
    });
  });
}

function spotifydl(url) {
  return new Promise((resolve, reject) => {
    axios.get(`https://api.fabdl.com/spotify/get?url=${encodeURIComponent(url)}`, {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"24\", \"Chromium\";v=\"116\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        Referer: "https://spotifydownload.org/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      }
    })
      .then(yanzz => {
        axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${yanzz.data.result.gid}/${yanzz.data.result.id}`, {
          headers: {
            accept: "application/json, text/plain, */*",
            "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "sec-ch-ua": "\"Not)A;Brand\";v=\"24\", \"Chromium\";v=\"116\"",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": "\"Android\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            Referer: "https://spotifydownload.org/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
          }
        })
          .then(yanz => {
            const result = {};
            result.title = yanzz.data.result.name;
            result.type = yanzz.data.result.type;
            result.artis = yanzz.data.result.artists;
            result.durasi = yanzz.data.result.duration_ms;
            result.image = yanzz.data.result.image;
            result.download = "https://api.fabdl.com" + yanz.data.result.download_url;
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      })
      .catch(error => {
        reject(error);
      });
  });
}

module.exports = {
  searching,
  getInfo,
  spotifydl
};