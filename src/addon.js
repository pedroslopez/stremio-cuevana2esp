const { addonBuilder } = require("stremio-addon-sdk")
const { getTopCatalog, getMovieMeta, getMovieStreams, searchMovies } = require('./cuevana');

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "me.pedroslopez.cuevana2esp",
	"version": "0.0.1",
	"catalogs": [
		{
			"type": "movie",
			"id": "top",
			"extra": [
				{ "name": "search", "isRequired": false }
			]
		}
	],
	"resources": [
		"catalog",
		"meta",
		"stream"
	],
	"types": ["movie"],
	"idPrefixes": ["c2e_"],
	"name": "Cuevana2 Español",
	"description": "Películas en español desde cuevana2espanol.com"
}
const builder = new addonBuilder(manifest);

const getMoviesCatalog = async (catalogName) => {
	let catalog;

	switch (catalogName) {
		case "top":
			catalog = await getTopCatalog();
			break;
		default:
			catalog = [];
			break;
	}

	return catalog;
}

builder.defineCatalogHandler(async ({type, id, extra}) => {
	let results;

	switch(type) {
		case "movie":
			if(extra && extra.search) {
				results = await searchMovies(extra.search);
			} else {
				results = await getMoviesCatalog(id);
			}
			
			break;
		default:
			results = [];
			break;
	}

	return { metas: results };
});


builder.defineMetaHandler(async ({type, id}) => {
	let meta;

	switch(type) {
		case 'movie':
			meta = await getMovieMeta(id);
			break;
		default:
			meta = null;
			break;
	}

	return { meta };
});

builder.defineStreamHandler(async ({type, id}) => {
	let streams;

	switch(type) {
		case 'movie':
			streams = await getMovieStreams(id);

			break;
		default:
			streams = [];
	}

	return { streams };
});

module.exports = builder.getInterface();