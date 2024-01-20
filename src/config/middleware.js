/** @format */

const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");



const configureMiddleware = (app) => {
  app.use(cors());
  app.use(cookieParser());
  app.use(bodyParser.json());


  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(require("../output/swagger-output.json")));

};

module.exports = configureMiddleware;
