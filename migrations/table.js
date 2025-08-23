const mysqlConnection = require("../config/db");
const committememberModel = require("../models/committeememberModel");
const sampledispatchModel = require("../models/sampledispatchModel");
const samplereceiveModel = require("../models/samplereceiveModel")
const sampleModel = require("../models/sampleModel");
const userModel = require("../models/registrationModel");

const cartModel = require("../models/cartModel");
const cityModel = require("../models/cityModel");
const countryModel = require("../models/countryModel");
const districtModel = require("../models/districtModel");
const biobankModel = require("../models/biobankModel");
const collectionsiteModel = require("../models/collectionsiteModel")
const csrModel = require("../models/CSRModel")
const organizationModel = require("../models/organizationModel")
const researcherModel = require("../models/researcherModel")
const newtablefieldModel = require("../models/newtablefieldModel")

const sample_approvalModel = require("../models/sampleapprovalModel")
const paymentModel = require('../models/paymentModals')
const samplefieldsModel = require('../models/samplefieldsModel')
const historyModel = require("../models/historyModel");
const contactusModel = require("../models/contactusModel");
const committeesampleapprovalModel = require("../models/committeesampleapproval")
const collectionsitestaffModel = require("../models/collectionsitestaffModel")
const sampleReturnModel = require("../models/sampleReturnModel")
const bankModel = require("../models/bankModel")

// Function to initialize all tables
function Database() {
  sampleModel.createPriceRequest()
  sampleModel.createPoolSampleTable();
  cityModel.createCityTable();
  historyModel.registrationadmin_history();
  countryModel.createCountryTable();
  districtModel.createDistrictTable();
  collectionsiteModel.create_collectionsiteTable();
  biobankModel.create_biobankTable();
  organizationModel.create_organizationTable();
  researcherModel.create_researcherTable();
  csrModel.create_CSRTable();
  userModel.createuser_accountTable();
  collectionsitestaffModel.create_collectionsitestaffTable();
  committememberModel.createCommitteeMemberTable();
  sampledispatchModel.createSampleDispatchTable();
  samplereceiveModel.createSampleReceiveTable();
  sampleModel.createSampleTable();
  cartModel.createCartTable();
  paymentModel.createPaymentTable();
  sample_approvalModel.createSampleApprovalTable();
  sample_approvalModel.createSampleDocumentTable();
  committeesampleapprovalModel.createcommitteesampleapprovalTable();
  samplefieldsModel.createEthnicityTable();
  samplefieldsModel.createSampleConditionTable();
  samplefieldsModel.createSamplePriceCurrencyTable();
  samplefieldsModel.createStorageTemperatureTable();
  samplefieldsModel.createContainerTypeTable()
  samplefieldsModel.createVolumeUnitTable();
  samplefieldsModel.createSampleTypeMatrixTable();
  samplefieldsModel.createTestMethodTable()
  samplefieldsModel.createTestResultUnitTable();
  samplefieldsModel.createTestSystemTable();
  samplefieldsModel.createTestSystemManufacturerTable();
  samplefieldsModel.createTestKitManufacturerTable();
  samplefieldsModel.createConcurrentMedicalConditionsTable();
  historyModel.create_historyTable();
  historyModel.create_samplehistoryTable();
  sampleReturnModel.createSampleReturnTable();
  contactusModel.createContactUsTable();
  samplefieldsModel.create_AnalyteTable();
  samplefieldsModel.create_infectiousdiseaseTable()
  bankModel.createBankTable();
 newtablefieldModel.createOrUpdateTables();
}
Database();