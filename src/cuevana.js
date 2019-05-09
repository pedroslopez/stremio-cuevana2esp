const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');

const getTopCatalog = async () => {
    const res = await cloudscraper.get('https://cuevana2espanol.com/calificaciones/');
    const $ = cheerio.load(res);

    let movies = [];
    $('.items article').each((index, element) => {
        let $el = $(element);

        let movie = {
            type: 'movie',
            id: 'c2e_' + $el.attr('id').substring(5),
            name: $el.find('.data h3 a').text(),
            poster: $el.find('.poster img').attr('src'),
            year: $el.find('.data span').text()
        }
        
        movies.push(movie);
    });

    movies.push({type: 'movie', id: 'c2e_dd', name:'test'});

    return movies;
}

const getMovieMeta = async (movieId) => {
    const postId = movieId.substring(4);
    const res = await cloudscraper.get('https://cuevana2espanol.com/?page_id=' + postId);
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

module.exports = { getTopCatalog, getMovieMeta };