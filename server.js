/********************************************************************************
 *  WEB322 – Assignment 05
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Naveed Ahmed Syed Student ID: 149739237 Date: 11th Dec,2024
 *
 *  Published URL: https://countries-information-web-app-3.onrender.com
 *
 ********************************************************************************/

const countryData = require("./modules/country-service");
const path = require("path");

const express = require("express");
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

// app.use(express.static('public')); // causing tailwindCSS not working on vercel.com
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// app.set('views', __dirname + '/views');

app.get("/", (req, res) => {
	res.render("home");
});

app.get("/about", (req, res) => {
	res.render("about");
});

app.get("/addCountry", async (req, res) => {
	let subRegions = await countryData.getAllSubRegions();
	res.render("addCountry", { subRegions });
});

app.post("/addCountry", async (req, res) => {
	try {
		await countryData.addCountry(req.body);
		res.redirect("/countries");
	} catch (err) {
		res.render("500", {
			message: `I'm sorry, but we have encountered the following error: ${err}`,
		});
	}
});

app.get("/countries", async (req, res) => {
	let countries = [];
	try {
		if (req.query.region) {
			countries = await countryData.getCountriesByRegion(req.query.region);
		} else if (req.query.subRegion) {
			countries = await countryData.getCountriesBySubRegion(
				req.query.subRegion
			);
		} else {
			countries = await countryData.getAllCountries();
		}

		res.render("countries", { countries });
	} catch (err) {
		res.status(404).render("404", { message: err });
	}
});

app.get("/countries/:id", async (req, res) => {
	try {
		let country = await countryData.getCountryById(req.params.id);
		// res.send(country);
		res.render("country", { country });
	} catch (err) {
		// console.log(" err:",  err)
		res.status(404).render("404", { message: err });
	}
});

app.get("/editCountry/:id", async (req, res) => {
	try {
		let country = await countryData.getCountryById(req.params.id);
		let subRegions = await countryData.getAllSubRegions();

		res.render("editCountry", { country, subRegions });
	} catch (err) {
		res.status(404).render("404", { message: err });
	}
});

app.post("/editCountry", async (req, res) => {
	try {
		await countryData.editCountry(req.body.id, req.body);
		res.redirect("/countries");
	} catch (err) {
		res.render("500", {
			message: `I'm sorry, but we have encountered the following error: ${err}`,
		});
	}
});

app.get("/deleteCountry/:id", async (req, res) => {
	try {
		await countryData.deleteCountry(req.params.id);
		res.redirect("/countries");
	} catch (err) {
		res.status(500).render("500", {
			message: `I'm sorry, but we have encountered the following error: ${err}`,
		});
	}
});

app.use((req, res, next) => {
	res.status(404).render("404", {
		message: "I'm sorry, we're unable to find what you're looking for",
	});
});

countryData.initialize().then(() => {
	app.listen(HTTP_PORT, () => {
		console.log(`server listening on: ${HTTP_PORT}`);
	});
});
