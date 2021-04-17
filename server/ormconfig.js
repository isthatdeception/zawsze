/**
 * as mentioned this is because of the ormconfig.js needs some js context but if we
 * keep trying to pass in .ts files, it will never run
 *
 * clearly one needs to get the compliation done where our srcipt is taking us to the overall
 * app. dist folder is our javascript oriented file so that one can easily get in running tp the
 * closest build to the production
 */

module.exports = {
  type: process.env.DB_TYPE,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: true,
  synchronize: true,
  entities: ["dist/**/*.js"],
};
