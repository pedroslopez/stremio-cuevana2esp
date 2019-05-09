const { addonBuilder } = require("stremio-addon-sdk")
const { getTopCatalog, getMovieMeta } = require('./cuevana');

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "community.cuevana2esp",
	"version": "0.0.1",
	"catalogs": [
		{
			"type": "movie",
			"id": "top"
		}
	],
	"resources": [
		"catalog",
		{
			"name": "meta",
			"types": ["movie"],
			"idPrefixes": ["c2e_"]
		}
	],
	"types": [
		"movie"
	],
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

builder.defineCatalogHandler(({type, id}) => {
	console.log("request for catalogs: "+type+" "+id)

	let results;

	switch(type) {
		case "movie":
			results = getMoviesCatalog(id);
			break;
		default:
			results = Promise.resolve([]);
			break;
	}

	return results.then(metas => ({metas}))
})


builder.defineMetaHandler(async ({type, id}) => {
	console.log("request for meta: "+type+" "+id)
	
	let result;

	switch(type) {
		case 'movie':
			result = await getMovieMeta(id);
			break;
		default:
			result = null;
			break;
	}

	console.log('RESULT HANDLER', result);

	return {meta: result};
})

module.exports = builder.getInterface();