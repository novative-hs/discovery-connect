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

const technical_approvalModel = require("../models/technicalapprovalModel")
const paymentModel = require('../models/paymentModals')
const samplefieldsModel = require('../models/samplefieldsModel')
const historyModel = require("../models/historyModel");
const contactusModel = require("../models/contactusModel");
const committeesampleapprovalModel = require("../models/committeesampleapproval")
const collectionsitestaffModel = require("../models/collectionsitestaffModel")
const sampleReturnModel = require("../models/sampleReturnModel")
const bankModel = require("../models/bankModel")
const orderModel = require("../models/orderModel")
// Function to initialize all tables
function Database() {
  // City,countrry,District
  cityModel.createCityTable();
  countryModel.createCountryTable();
  districtModel.createDistrictTable();
  bankModel.createBankTable();
  contactusModel.createContactUsTable();

  // Users Table
  userModel.createuser_accountTable();
  biobankModel.create_biobankTable();
  collectionsiteModel.create_collectionsiteTable();
  collectionsitestaffModel.create_collectionsitestaffTable();
  committememberModel.createCommitteeMemberTable();
  organizationModel.create_organizationTable();
  researcherModel.create_researcherTable();
  csrModel.create_CSRTable();
  historyModel.create_historyTable();

  // Sample Related tables
  sampleModel.createSampleTable();
  sampledispatchModel.createSampleDispatchTable();
  samplereceiveModel.createSampleReceiveTable();
  sampleModel.createPriceRequest()
  sampleModel.createPoolSampleTable();
  historyModel.create_samplehistoryTable();
sampleReturnModel.createSampleReturnTable()
  // Order Related Tables
  orderModel.createOrderTable()
  cartModel.createCartTable();
  paymentModel.createPaymentTable();
  technical_approvalModel.createSampleDocumentTable();
  technical_approvalModel.createTechnicalApprovalTable();
  committeesampleapprovalModel.createcommitteesampleapprovalTable();
  orderModel.createOrderDispatch();

  samplefieldsModel.createEthnicityTable();
  samplefieldsModel.create_AnalyteTable();
  samplefieldsModel.create_infectiousdiseaseTable()
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
  historyModel.registrationadmin_history();

   newtablefieldModel.createOrUpdateTables();
}
Database();