const { addonBuilder } = require("stremio-addon-sdk")

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

const getMoviesCatalog = (catalogName) => {
	let catalog;

	switch (catalogName) {
		case "top":
			catalog = [
				{
					id: "c2e_bbb",
					type: "movie",
					name: "Jellyfish",
					poster: "https://cuevana2espanol.com/wp-content/uploads/2019/04/bIDRyNDCrupfDdzP1AlsCYjGXE3-185x278.jpg"
				}
			];
			break;
		default:
			catalog = [];
			break;
	}

	return Promise.resolve(catalog);
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

const getMovieMeta = id => {
	console.log(id);
	const metas = {
		c2e_bbb: {
            id: "c2e_bbb",
            type: "movie",
            name: "Jellyfish",
			poster: "https://cuevana2espanol.com/wp-content/uploads/2019/04/bIDRyNDCrupfDdzP1AlsCYjGXE3-185x278.jpg",
            genres: ["Demo", "Nature"],
            description: "A .mkv video clip useful for testing the network streaming and playback performance of media streamers & HTPCs.",
            cast: ["Some random jellyfishes"],
            director: ["ScottAllyn"],
            background: "https://image.tmdb.org/t/p/original/lFwykSz3Ykj1Q3JXJURnGUTNf1o.jpg",
            runtime: "30 sec"
        },
	}

	console.log(metas[id]);

	return Promise.resolve(metas[id] || null);
}

builder.defineMetaHandler(({type, id}) => {
	console.log("request for meta: "+type+" "+id)
	
	let results;

	switch(type) {
		case 'movie':
			results = getMovieMeta(id);
			break;
		default:
			results = null;
			break;
	}

	console.log('RESULT HANDLER', results);

	return results.then(meta => ({meta}));
})

module.exports = builder.getInterface()