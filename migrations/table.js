const mysqlConnection = require("../config/db");
const committememberModel = require("../models/committeememberModel");
const sampledispatchModel = require("../models/sampledispatchModel");
const samplereceiveModel=require("../models/samplereceiveModel")
const sampleModel = require("../models/sampleModel");
const signupModel = require("../models/registrationModel");
const productModel = require("../models/productModel");
const wishlistModel = require("../models/wishlistModel");
const cartModel = require("../models/cartModel");
const cityModel = require("../models/cityModel");
const historyModel = require("../models/historyModel");
const countryModel = require("../models/countryModel");
const districtModel = require("../models/districtModel");
const sample_approvalModel=require("../models/sampleapprovalModel")
const paymentModel=require('../models/paymentModals')
const ethnicityModel=require('../models/ethnicityModel')
const sampleconditionModel=require('../models/sampleconditionModel')
const storagetemperatureModel=require('../models/storagetemperatureModel')
const containertypeModel=require('../models/containertypeModel')
const quantityunitModel=require('../models/quantityunitModel')
const sampletypematrixModel=require('../models/sampletypematrixModel')
const testmethodModel=require('../models/testmethodModel')
const testresultunitModel=require('../models/testresultunitModel')
const testsystemModel=require('../models/testsystemModel')
const testsystemmanufacturerModel=require('../models/testsystemmanufacturerModel')
const testkitmanufacturerModel=require('../models/testkitmanufacturerModel')
const concurrentmedicalconditionsModel=require('../models/concurrentmedicalconditionsModel')
// Function to initialize all tables
function Database() {
  ethnicityModel.createEthnicityTable();
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
  //samplereceiveModel.createSampleReceiveTable();
  sampleModel.createSampleTable();
  productModel.createProductsTable();
  wishlistModel.createWishlistTable();
  cartModel.createCartTable();
  //sample_approvalModel.createSampleApprovalTable();
 paymentModel.createPaymentTable();
 sampleconditionModel.createSampleConditionTable();
 storagetemperatureModel.createStorageTemperatureTable();
 containertypeModel.createContainerTypeTable()
 quantityunitModel.createQuantityUnitTable();
 sampletypematrixModel.createSampleTypeMatrixTable();
 testmethodModel.createTestMethodTable()
testresultunitModel.createTestResultUnitTable();
 testsystemModel.createTestSystemTable();
 testsystemmanufacturerModel.createTestSystemManufecturerTable();
 testkitmanufacturerModel.createTestKitManufacturerTable();
 concurrentmedicalconditionsModel.createConcurrentMedicalConditionsTable();
}
Database();