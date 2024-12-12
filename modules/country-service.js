require("dotenv").config();

require("pg");
const Sequelize = require("sequelize");

let sequelize = new Sequelize(
	process.env.DB_DATABASE,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: "postgres",
		port: 5432,
		dialectOptions: {
			ssl: { rejectUnauthorized: false },
		},
	}
);

const SubRegion = sequelize.define(
	"SubRegion",
	{
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		subRegion: Sequelize.STRING,
		region: Sequelize.STRING,
	},
	{
		createdAt: false,
		updatedAt: false,
	}
);

const Country = sequelize.define(
	"Country",
	{
		id: {
			type: Sequelize.STRING,
			primaryKey: true,
		},
		commonName: Sequelize.STRING,
		officialName: Sequelize.STRING,
		nativeName: Sequelize.STRING,
		currencies: Sequelize.STRING,
		capital: Sequelize.STRING,
		languages: Sequelize.STRING,
		openStreetMaps: Sequelize.STRING,
		population: Sequelize.INTEGER,
		area: Sequelize.INTEGER,
		landlocked: Sequelize.BOOLEAN,
		coatOfArms: Sequelize.STRING,
		flag: Sequelize.STRING,
		subRegionId: Sequelize.INTEGER,
	},
	{
		createdAt: false,
		updatedAt: false,
	}
);

Country.belongsTo(SubRegion, { foreignKey: "subRegionId" });

function initialize() {
	return new Promise(async (resolve, reject) => {
		try {
			await sequelize.sync();
			resolve();
		} catch (err) {
			reject(err.message);
		}
	});
}

function getAllCountries() {
	return new Promise(async (resolve, reject) => {
		try {
			let countries = await Country.findAll({ include: [SubRegion] });
			resolve(countries);
		} catch (err) {
			reject(err.message);
		}
	});
}

function getCountryById(id) {
	return new Promise(async (resolve, reject) => {
		try {
			let foundCountry = await Country.findAll({
				include: [SubRegion],
				where: { id: id },
			});
			if (foundCountry.length > 0) {
				resolve(foundCountry[0]);
			} else {
				reject("Unable to find requested country");
			}
		} catch (err) {
			reject(err.message);
		}
	});
}

function getCountriesBySubRegion(subRegion) {
	return new Promise(async (resolve, reject) => {
		try {
			let foundCountries = await Country.findAll({
				include: [SubRegion],
				where: {
					"$SubRegion.subRegion$": {
						[Sequelize.Op.iLike]: `%${subRegion}%`,
					},
				},
			});
			if (foundCountries.length > 0) {
				resolve(foundCountries);
			} else {
				reject("Unable to find requested countries");
			}
		} catch (err) {
			reject(err.message);
		}
	});
}

function getCountriesByRegion(region) {
	return new Promise(async (resolve, reject) => {
		try {
			let foundCountries = await Country.findAll({
				include: [SubRegion],
				where: {
					"$SubRegion.region$": region,
				},
			});
			if (foundCountries.length > 0) {
				resolve(foundCountries);
			} else {
				reject("Unable to find requested countries");
			}
		} catch (err) {
			reject(err.message);
		}
	});
}

function addCountry(countryData) {
	return new Promise(async (resolve, reject) => {
		try {
			countryData.landlocked = countryData.landlocked ? true : false;
			await Country.create(countryData);
			resolve();
		} catch (err) {
			reject(err.errors[0].message);
		}
	});
}

function editCountry(id, countryData) {
	return new Promise(async (resolve, reject) => {
		try {
			countryData.landlocked = countryData.landlocked ? true : false;
			await Country.update(countryData, { where: { id: id } });
			resolve();
		} catch (err) {
			reject(err.errors[0].message);
		}
	});
}

function deleteCountry(id) {
	return new Promise(async (resolve, reject) => {
		try {
			await Country.destroy({
				where: { id: id },
			});
			resolve();
		} catch (err) {
			reject(err.errors[0].message);
		}
	});
}

function getAllSubRegions() {
	return new Promise(async (resolve, reject) => {
		try {
			let subRegions = await SubRegion.findAll();
			resolve(subRegions);
		} catch (err) {
			reject(err.message);
		}
	});
}

module.exports = {
	initialize,
	getAllCountries,
	getCountryById,
	getCountriesByRegion,
	getCountriesBySubRegion,
	getAllSubRegions,
	addCountry,
	editCountry,
	deleteCountry,
};
