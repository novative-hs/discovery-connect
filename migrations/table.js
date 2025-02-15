const mysqlConnection = require("../config/db");
const committememberModel = require("../models/committeememberModel");
const sampledispatchModel = require("../models/sampledispatchModel");
const samplereceiveModel = require("../models/samplereceiveModel")
const sampleModel = require("../models/sampleModel");
const signupModel = require("../models/registrationModel");
const productModel = require("../models/productModel");
const wishlistModel = require("../models/wishlistModel");
const cartModel = require("../models/cartModel");
const cityModel = require("../models/cityModel");
const countryModel = require("../models/countryModel");
const districtModel = require("../models/districtModel");

const sample_approvalModel=require("../models/sampleapprovalModel")
const paymentModel=require('../models/paymentModals')


const ethnicityModel=require('../models/samplefieldsModel')
const sampleconditionModel=require('../models/samplefieldsModel')
const storagetemperatureModel=require('../models/samplefieldsModel')
const containertypeModel=require('../models/samplefieldsModel')
const quantityunitModel=require('../models/samplefieldsModel')
const sampletypematrixModel=require('../models/samplefieldsModel')
const testmethodModel=require('../models/samplefieldsModel')
const testresultunitModel=require('../models/samplefieldsModel')
const testsystemModel=require('../models/samplefieldsModel')
const testsystemmanufacturerModel=require('../models/samplefieldsModel')
const testkitmanufacturerModel=require('../models/samplefieldsModel')
const concurrentmedicalconditionsModel=require('../models/samplefieldsModel')
const historyModel = require("../models/historyModel");

// Function to initialize all tables
function Database() {

  cityModel.createCityTable();
  historyModel.RegistrationAdmin_History();
  countryModel.createCountryTable();
  districtModel.createDistrictTable();
  signupModel.create_collectionsiteTable();
  signupModel.create_biobankTable();
  signupModel.create_organizationTable();
  signupModel.create_researcherTable();
  signupModel.createuser_accountTable();
  committememberModel.createCommitteeMemberTable();
  sampledispatchModel.createSampleDispatchTable();
  samplereceiveModel.createSampleReceiveTable();
  sampleModel.createSampleTable();
  productModel.createProductsTable();
  wishlistModel.createWishlistTable();
  cartModel.createCartTable();
  sample_approvalModel.createSampleApprovalTable();
 paymentModel.createPaymentTable();
 ethnicityModel.createEthnicityTable();
 sampleconditionModel.createSampleConditionTable();
 storagetemperatureModel.createStorageTemperatureTable();
 containertypeModel.createContainerTypeTable()
 quantityunitModel.createQuantityUnitTable();
 sampletypematrixModel.createSampleTypeMatrixTable();
 testmethodModel.createTestMethodTable()
testresultunitModel.createTestResultUnitTable();
 testsystemModel.createTestSystemTable();
 testsystemmanufacturerModel.createTestSystemManufacturerTable();
 testkitmanufacturerModel.createTestKitManufacturerTable();
 concurrentmedicalconditionsModel.createConcurrentMedicalConditionsTable();
 historyModel.RegistrationAdmin_History();
 historyModel.create_historyTable();
 historyModel.create_samplehistoryTable();
 

}
Database();