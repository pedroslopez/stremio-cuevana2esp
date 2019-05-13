const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');
const url = require('url');
const { compareTwoStrings } = require('string-similarity');

const { 
    ID_PREFIX, 
    IMDB_PREFIX, 
    CUEVANA_URL, 
    CUEVANA_PLAYER_URL, 
    TMDB_API_KEY, 
    IMDB_SIMILARITY_THRESHOLD 
} = require('./constants');

const getTopCatalog = async () => {
    const res = await cloudscraper.get(CUEVANA_URL + '/calificaciones/');
    const $ = cheerio.load(res);

    let movies = [];
    $('.items article').each((index, element) => {
        let $el = $(element);

        let movie = {
            type: 'movie',
            id: ID_PREFIX + $el.find('.data h3 a').attr('href'),
            name: $el.find('.data h3 a').text(),
            poster: $el.find('.poster img').attr('src'),
            year: $el.find('.data span').text()
        }
        
        movies.push(movie);
    });

    return movies;
}

const searchMovies = async (searchTerm) => {
    const res = await cloudscraper.get(CUEVANA_URL + '?s=' + encodeURIComponent(searchTerm));
    const $ = cheerio.load(res);

    let movies = [];
    $('.result-item article').each((index, element) => {
        let $el = $(element);

        let movie = {
            type: 'movie',
            id: ID_PREFIX + $el.find('.details .title a').attr('href'),
            name: $el.find('.details .title a').text(),
            poster: $el.find('.image img').attr('src'),
            year: $el.find('.details .meta .year').text()
        }
        
        movies.push(movie);
    });

    return movies;
}

const getMovieMeta = async (movieId) => {
    const pageUrl = movieId.substring(ID_PREFIX.length);
    const res = await cloudscraper.get(pageUrl);
    const $ = cheerio.load(res);

    return {
        id: movieId,
        type: 'movie',
        name: $('.sheader .data h1').text(),
        poster: $('.sheader .poster img').attr('src'),
        description: $('#info > div.wp-content > p').text(),
        background: $('#dt_galery .g-item a').first().attr('href').replace('\n', ''),
        runtime: $('.data .extra .runtime').text()
    }
}

const getVideo = async (fileId) => {
    const res = await cloudscraper.post({
        uri: CUEVANA_PLAYER_URL + 'plugins/gkpluginsphp.php',
        formData: { link: fileId }
    });

    const video = JSON.parse(res);

    if(video.type == 'mp4') {
        return video.link;
    } 

    return false;
}

const getTMDBReqUrl = (imdbUrl) => 
    `https://api.themoviedb.org/3/find/${imdbUrl}?api_key=${TMDB_API_KEY}&language=es&external_source=imdb_id`;

const matchToCuevana = async (title, year) => {
    const cuevanaSearch = await searchMovies(title);

    for(let i=0; i<cuevanaSearch.length && i<3; i++) {
        let result = cuevanaSearch[i];
        const similarity = compareTwoStrings(title, result.name);
        const sameYear = !year || result.year == year;
        
        if(similarity > IMDB_SIMILARITY_THRESHOLD && sameYear) {
            return result.id;
        } 
    }
}

const getImdbStreams = async (imdbId) => {
    let res = await cloudscraper.get(getTMDBReqUrl(imdbId));
    res = JSON.parse(res);

    if(res.movie_results && res.movie_results[0]) {
        const tmdb = res.movie_results[0];

        // Match Translated
        const searchYear = tmdb.release_date.split('-')[0];
        let match = await matchToCuevana(tmdb.title, searchYear);

        if(!match && tmdb.title != tmdb.original_title) {
            // Try matching with original name
            match = await matchToCuevana(tmdb.original_title, searchYear);
        }

        if(match) {
            return await getCuevanaStreams(match);
        }
  
    }
    
    return [];
}

const getCuevanaStreams = async (movieId) => {
    const pageUrl = movieId.substring(ID_PREFIX.length);
    const res = await cloudscraper.get(pageUrl);
    const $ = cheerio.load(res);

    let streams = [];
    let promises = [];

    $('.play-box-iframe iframe').each(async (index, element) => {
        let $el = $(element);

        let frameUrl = $el.attr('src');
        if(!frameUrl.startsWith(CUEVANA_PLAYER_URL + 'index')) {
            return;
        }

        const fileId = url.parse(frameUrl, true).query.file;
        
        const videoPromise = getVideo(fileId);
        promises.push(videoPromise);
        
        const videoUrl = await videoPromise;

        if(!videoUrl) {
            return;
        }

        let stream = {
            title: $('.idTabs.sourceslist li a').eq(index).text().trim() + '\n🇪🇸 Español',
            url: videoUrl
        }
        
        streams.push(stream);
    })

    await Promise.all(promises);
    return streams;
    
}

const getMovieStreams = async (id) => {
    if(id.startsWith(ID_PREFIX)) {
        return await getCuevanaStreams(id);
    } else if(id.startsWith(IMDB_PREFIX) && TMDB_API_KEY) {
        return await getImdbStreams(id);
    }

    return [];
}

module.exports = { getTopCatalog, getMovieMeta, getMovieStreams, searchMovies };