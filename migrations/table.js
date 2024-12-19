const mysqlConnection = require("../config/db");
const collectionsiteModel = require("../models/collectionsiteModel");
const committememberModel = require("../models/committeememberModel");
const organizationModel = require("../models/organizationModel");
const researcherModel = require("../models/researcherModel");
const sampledispatchModel = require("../models/sampledispatchModel");
const sampleModel = require("../models/sampleModel");


// Function to initialize all tables
function Database() {
  collectionsiteModel.createCollectionSiteTable();
  committememberModel.createCommitteeMemberTable();
  organizationModel.createOrganizationTable();
  researcherModel.createResearcherTable();
  sampledispatchModel.createSampleDispatchTable();
  sampleModel.createSampleTable();

}

Database();
