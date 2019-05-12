const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');
const url = require('url');

const getTopCatalog = async () => {
    const res = await cloudscraper.get('https://cuevana2espanol.com/calificaciones/');
    const $ = cheerio.load(res);

    let movies = [];
    $('.items article').each((index, element) => {
        let $el = $(element);

        let movie = {
            type: 'movie',
            id: 'c2e_' + $el.find('.data h3 a').attr('href'),
            name: $el.find('.data h3 a').text(),
            poster: $el.find('.poster img').attr('src'),
            year: $el.find('.data span').text()
        }
        
        movies.push(movie);
    });

    return movies;
}

const searchMovies = async (searchTerm) => {
    const res = await cloudscraper.get('https://cuevana2espanol.com/?s=' + encodeURIComponent(searchTerm));
    const $ = cheerio.load(res);

    let movies = [];
    $('.result-item article').each((index, element) => {
        let $el = $(element);

        let movie = {
            type: 'movie',
            id: 'c2e_' + $el.find('.details .title a').attr('href'),
            name: $el.find('.details .title a').text(),
            poster: $el.find('.image img').attr('src'),
            year: $el.find('.details .meta .year').text()
        }
        
        movies.push(movie);
    });

    return movies;
}

const getMovieMeta = async (movieId) => {
    const pageUrl = movieId.substring(4);
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
        uri: 'https://player.cuevana2espanol.com/plugins/gkpluginsphp.php',
        formData: { link: fileId }
    });

    const video = JSON.parse(res);

    if(video.type == 'mp4') {
        return video.link;
    } 

    return false;
}

const getMovieStreams = async (movieId) => {
    const pageUrl = movieId.substring(4);
    const res = await cloudscraper.get(pageUrl);
    const $ = cheerio.load(res);

    let streams = [];
    let promises = [];

    $('.play-box-iframe iframe').each(async (index, element) => {
        let $el = $(element);

        let frameUrl = $el.attr('src');
        if(!frameUrl.startsWith('https://player.cuevana2espanol.com/index')) {
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
            title: $('.idTabs.sourceslist li a').eq(index).text().trim(),
            url: videoUrl
        }
        
        streams.push(stream);
    })

    await Promise.all(promises);
    return streams;
    
}

module.exports = { getTopCatalog, getMovieMeta, getMovieStreams, searchMovies };