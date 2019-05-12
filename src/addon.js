const { addonBuilder } = require("stremio-addon-sdk")
const { getTopCatalog, getMovieMeta, getMovieStreams, searchMovies } = require('./cuevana');

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "community.cuevana2esp",
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
	"name": "cuevana2esp",
	"description": "Browse and watch movies in spanish!"
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

builder.defineCatalogHandler(({type, id, extra}) => {
	console.log("request for catalogs: "+type+" "+id, extra)

	let results;

	switch(type) {
		case "movie":
			if(extra && extra.search) {
				results = searchMovies(extra.search);
			} else {
				results = getMoviesCatalog(id);
			}
			
			break;
		default:
			results = Promise.resolve([]);
			break;
	}

	return results.then(metas => ({ metas }))
});


builder.defineMetaHandler(async ({type, id}) => {
	console.log("request for meta: "+type+" "+id)
	
	let meta;

	switch(type) {
		case 'movie':
			meta = await getMovieMeta(id);
			break;
		default:
			meta = null;
			break;
	}

	console.log('RESULT HANDLER', meta);

	return { meta };
});

builder.defineStreamHandler(async ({type, id}) => {
	console.log("request for stream: "+type+" "+id);

	let streams;

	switch(type) {
		case 'movie':
			streams = await getMovieStreams(id);

			break;
		default:
			streams = [];
	}

	console.log('STREAM HANDLER', streams);
	return { streams };
});

module.exports = builder.getInterface();