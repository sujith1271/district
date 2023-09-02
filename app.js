const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
const app = express();
app.use(express.json());
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("Server is running"));
  } catch (error) {
    console.log(`error is ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const objectConversion = (objectMan) => {
  return {
    stateId: objectMan.state_id,
    stateName: objectMan.state_name,
    population: objectMan.population,
  };
};
const objectConversion1 = (objectNew) => {
  return {
    districtId: objectNew.district_id,
    districtName: objectNew.district_name,
    stateId: objectNew.state_id,
    cases: objectNew.cases,
    cured: objectNew.cured,
    active: objectNew.active,
    deaths: objectNew.death,
  };
};
const conversion2 = (objectCon) => {
  return {
    totalCases: objectCon.cases,
    totalCured: objectCon.cured,
    totalActive: objectCon.active,
    totalDeaths: objectCon.deaths,
  };
};
app.get("/states/", async (request, response) => {
  const getQuery = `SELECT *
    FROM state
    ORDER BY state_id;`;
  const stateList = await db.all(getQuery);
  const functionConversion = stateList.map((eachItem) => {
    return objectConversion(eachItem);
  });
  response.send(functionConversion);
});
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getIdQuery = `SELECT *
    FROM state
    WHERE 
        state_id=${stateId}`;
  const dbResponse = await db.get(getIdQuery);
  const stateQuery = objectConversion(dbResponse);
  response.send(stateQuery);
});
app.post("/districts/", async (request, response) => {
  const createRequest = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = createRequest;
  const postQuery = `INSERT INTO
    district(district_name,state_id,cases,cured,active,deaths)
    VALUES('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  const addDistrict = await db.run(postQuery);
  const districtId = addDistrict.lastId;
  response.send("District Successfully Added");
});
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getIdQuery = `
    SELECT *
    FROM district
    WHERE 
        district_id=${districtId};`;
  const dbResponse = await db.get(getIdQuery);
  const districtQuery = objectConversion1(dbResponse);
  response.send(districtQuery);
});
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getIdQuery = `DELETE 
    FROM district
    WHERE 
        district_id=${districtId}`;
  await db.run(getIdQuery);
  response.send("District Removed");
});
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const createRequest = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = createRequest;
  const postQuery = `UPDATE 
    district 
    SET 
        district_name='${districtName}',
        state_id=${stateId},
        cases=${cases},
        cured=${cured},
        active=${active},
        deaths=${deaths})
    WHERE 
        district_id=${districtId}`;
  const putQuery = await db.run(postQuery);
  response.send("District Details Updated");
});
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateReport = `
    SELECT SUM(cases) AS cases,
     SUM(cured) AS cured,
     SUM(active) AS active,
     SUM(deaths) AS deaths
    FROM state 
    WHERE state_id={stateId};`;
  const getQuery = await db.get(getStateReport);
  const resultReport = conversion2(getQuery);
  response.send(resultReport);
});
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
    select state_id from district
    where district_id = ${districtId};
    `;
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);
  const getStateNameQuery = `
    select state_name as stateName from state
    where state_id = ${getDistrictIdQueryResponse.state_id};
    `;
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
});

module.exports = app;
