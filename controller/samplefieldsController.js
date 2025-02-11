
const ethnicityModel = require("../models/samplefieldsModel");
const sampleconditionModel = require("../models/samplefieldsModel");
const storagetemperatureModel = require("../models/samplefieldsModel");
const containertypeModel = require("../models/samplefieldsModel");
const quantityunitModel = require("../models/samplefieldsModel");
const sampletypematrixModel = require("../models/samplefieldsModel");
const testmethodModel = require("../models/samplefieldsModel");
const testresultunitModel = require("../models/samplefieldsModel");
const concurrentmedicalconditionsModel = require("../models/samplefieldsModel");
const testkitmanufacturerModel = require("../models/samplefieldsModel");
const testsystemModel = require("../models/samplefieldsModel");
const testsystemmanufacturerModel = require("../models/samplefieldsModel");

                                                         // ETHNICITY
// Controller for creating the ethnicity table
const createEthnicityTable = (req, res) => {
    ethnicityModel.createEthnicityTable();
  res.status(200).json({ message: "Ethnicity table creation process started" });
};
// Controller to get all ethnicity
const getAllEthnicity = (req, res) => {
    ethnicityModel.getAllEthnicity((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Ethnicity list" });
    }
    res.status(200).json(results);
  });
};
// Controller to create a ethnicity
const createEthnicity = (req, res) => {
    const newEthnicityData = req.body;
    console.log('Received Ethnicity Data:', newEthnicityData); // Log the incoming data for debugging
    // Pass the newethnicityData directly to the model
    ethnicityModel.createEthnicity(newEthnicityData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Ethnicity" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Ethnicity added successfully", id: result.insertId });
    });
};
// Controller to update a ethnicity
const updateEthnicity = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  ethnicityModel.updateEthnicity(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Ethnicity" });
    }
    res.status(200).json({ message: "Ethnicity updated successfully" });
  });
};
// Controller to delete ethnicity
const deleteEthnicity = (req, res) => {
  const { id } = req.params;
  ethnicityModel.deleteEthnicity(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Ethnicity" });
    }
    res.status(200).json({ message: "Ethnicity deleted successfully" });
  });
};
// Controller to fetch ethnicity names
const getEthnicityNames = (req, res) => {
    ethnicityModel.getEthnicityNames((err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'An error occurred while fetching data' });
        }
        // Extracting only names
        const ethnicityNames = results.map(row => row.name);
        res.status(200).json(ethnicityNames);
    });
};

                                                       // SAMPLE CONDITION
// Controller for creating the sample condition table
const createSampleConditionTable = (req, res) => {
    sampleconditionModel.createSampleConditionTable();
  res.status(200).json({ message: "Sample Condition table creation process started" });
};
// Controller to get all sample condition
const getAllSampleCondition = (req, res) => {
    sampleconditionModel.getAllSampleCondition((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Sample Condition list" });
    }
    res.status(200).json(results);
  });
};
// Controller to create a sample condition 
const createSampleCondition = (req, res) => {
    const newSampleConditionData = req.body;
    console.log('Received Sample Condition Data:', newSampleConditionData); // Log the incoming data for debugging
  
    // Pass the newCityData directly to the model
    sampleconditionModel.createSampleCondition(newSampleConditionData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Sample Condition" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Sample Condition added successfully", id: result.insertId });
    });
};
// Controller to update sample condition 
const updateSampleCondition = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  sampleconditionModel.updateSampleCondition(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Sample Condition" });
    }
    res.status(200).json({ message: "Sample Condition updated successfully" });
  });
};
// Controller to delete sample condition 
const deleteSampleCondition = (req, res) => {
  const { id } = req.params;
  sampleconditionModel.deleteSampleCondition(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Sample Condition" });
    }
    res.status(200).json({ message: "Sample Condition deleted successfully" });
  });
};
// Controller to fetch sample condition names
const getSampleConditionNames = (req, res) => {
    sampleconditionModel.getSampleConditionNames((err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'An error occurred while fetching data' });
        }
        // Extracting only names
        const SampleConditionNames = results.map(row => row.name);
        res.status(200).json(SampleConditionNames);
    });
};

                                                         // STORAGE TEMPERATURE
// Controller for creating the storage temperature table
const createStorageTemperatureTable = (req, res) => {
    storagetemperatureModel.createStorageTemperatureTable();
  res.status(200).json({ message: "Storage Temperature table creation process started" });
};
// Controller to get all storage temperature
const getAllStorageTemperature = (req, res) => {
    storagetemperatureModel.getAllStorageTemperature((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Storage Temperature list" });
    }
    res.status(200).json(results);
  });
};
// Controller to create a storage temperature
const createStorageTemperature = (req, res) => {
    const newStorageTemperatureData = req.body;
    console.log('Received Storage Temperature Data:', newStorageTemperatureData); // Log the incoming data for debugging
  
    // Pass the newCityData directly to the model
    storagetemperatureModel.createStorageTemperature(newStorageTemperatureData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Storage Temperature" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Storage Temperature added successfully", id: result.insertId });
    });
};
// Controller to update a storage temperature
const updateStorageTemperature = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  storagetemperatureModel.updateStorageTemperature(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Storage Temperature" });
    }
    res.status(200).json({ message: "Storage Temperature updated successfully" });
  });
};
// Controller to delete storage temperature
const deleteStorageTemperature = (req, res) => {
  const { id } = req.params;
  storagetemperatureModel.deleteStorageTemperature(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Storage Temperature" });
    }
    res.status(200).json({ message: "Storage Temperature deleted successfully" });
  });
};
// Controller to fetch storage temperature names
const getStorageTemperatureNames = (req, res) => {
  storagetemperatureModel.getStorageTemperatureNames((err, results) => {
      if (err) {
          console.error('Error fetching data:', err);
          return res.status(500).json({ error: 'An error occurred while fetching data' });
      }
      // Extracting only names
      const StorageTemperatureNames = results.map(row => row.name);
      res.status(200).json(StorageTemperatureNames);
  });
};

                                                         // CONTAINER TYPE
// Controller for creating the container type table
const createContainerTypeTable = (req, res) => {
    containertypeModel.createContainerTypeTable();
  res.status(200).json({ message: "Container Type table creation process started" });
};
// Controller to get all container type
const getAllContainerType= (req, res) => {
    containertypeModel.getAllContainerType((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Container Type list" });
    }
    res.status(200).json(results);
  });
};
// Controller to create a container type
const createContainerType = (req, res) => {
    const newContainerTypeData = req.body;
    console.log('Received Container Type Data:', newContainerTypeData); // Log the incoming data for debugging
  
    // Pass the newCityData directly to the model
    containertypeModel.createContainerType(newContainerTypeData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Container Type" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Container Type added successfully", id: result.insertId });
    });
};
// Controller to update container type
const updateContainerType = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  containertypeModel.updateContainerType(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Container Type" });
    }
    res.status(200).json({ message: "Container Type updated successfully" });
  });
};
// Controller to delete a container type
const deleteContainerType = (req, res) => {
  const { id } = req.params;
  containertypeModel.deleteContainerType(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Container Type" });
    }
    res.status(200).json({ message: "Container Type deleted successfully" });
  });
};
// Controller to fetch container type names
const getContainerTypeNames = (req, res) => {
    containertypeModel.getContainerTypeNames((err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'An error occurred while fetching data' });
        }
        // Extracting only names
        const ContainerTypeNames = results.map(row => row.name);
        res.status(200).json(ContainerTypeNames);
    });
};

                                                         // QUANTITY UNIT
// Controller for creating the quantity unit table
const createQuantityUnitTable = (req, res) => {
    quantityunitModel.createQuantityUnitTable();
  res.status(200).json({ message: "Quantity Unit table creation process started" });
};
// Controller to get all quantity unit
const getAllQuantityUnit= (req, res) => {
    quantityunitModel.getAllQuantityUnit((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Quantity Unit list" });
    }
    res.status(200).json(results);
  });
};
// Controller to create a Quantity Unit
const createQuantityUnit = (req, res) => {
    const newQuantityUnitData = req.body;
    console.log('Received Quantity Unit Data:', newQuantityUnitData); // Log the incoming data for debugging
  
    // Pass the newCityData directly to the model
    quantityunitModel.createQuantityUnit(newQuantityUnitData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Quantity Unit" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Quantity Unit added successfully", id: result.insertId });
    });
};
// Controller to update a Quantity Unit
const updateQuantityUnit = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  quantityunitModel.updatequantityunit(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Quantity Unit" });
    }
    res.status(200).json({ message: "Quantity Unit updated successfully" });
  });
};
// Controller to delete a Quantity Unit
const deleteQuantityUnit = (req, res) => {
  const { id } = req.params;
  quantityunitModel.deleteQuantityUnit(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Quantity Unit" });
    }
    res.status(200).json({ message: "Quantity Unit deleted successfully" });
  });
};
// Controller to fetch quantity unit names
const getQuantityUnitNames = (req, res) => {
    quantityunitModel.getQuantityUnitNames((err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'An error occurred while fetching data' });
        }
        // Extracting only names
        const QuantityUnitNames = results.map(row => row.name);
        res.status(200).json(QuantityUnitNames);
    });
};

                                                         // SAMPLE TYPE MATRIX
// Controller for creating the SampleTypeMatrix table
const createSampleTypeMatrixTable = (req, res) => {
    sampletypematrixModel.createSampleTypeMatrixTable();
  res.status(200).json({ message: "Sample Type Matrix table creation process started" });
};
// Controller to get all SampleTypeMatrix
const getAllSampleTypeMatrix= (req, res) => {
    sampletypematrixModel.getAllSampleTypeMatrix((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Sample Type Matrix list" });
    }
    res.status(200).json(results);
  });
};
// Controller to create a SampleTypeMatrix 
const createSampleTypeMatrix = (req, res) => {
    const newSampleTypeMatrixData = req.body;
    console.log('Received Sample Type Matrix Data:', newSampleTypeMatrixData); // Log the incoming data for debugging
  
    // Pass the newSampleTypeMatrixData directly to the model
    sampletypematrixModel.createSampleTypeMatrix(newSampleTypeMatrixData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Sample Type Matrix" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Sample Type Matrix added successfully", id: result.insertId });
    });
};
// Controller to update a SampleTypeMatrix
const updateSampleTypeMatrix = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  sampletypematrixModel.updateSampleTypeMatrix(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Sample Type Matrix " });
    }
    res.status(200).json({ message: "Sample Type Matrix updated successfully" });
  });
};
// Controller to delete a SampleTypeMatrix
const deleteSampleTypeMatrix= (req, res) => {
  const { id } = req.params;
  sampletypematrixModel.deleteSampleTypeMatrix(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Sample Type Matrix" });
    }
    res.status(200).json({ message: "Sample Type Matrix deleted successfully" });
  });
};
// Controller to fetch SampleTypeMatrix names
const getSampleTypeMatrixNames = (req, res) => {
    sampletypematrixModel.getSampleTypeMatrixNames((err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'An error occurred while fetching data' });
        }
        // Extracting only names
        const SampleTypeMatrixNames = results.map(row => row.name);
        res.status(200).json(SampleTypeMatrixNames);
    });
};

                                                         // TEST METHOD
// Controller for creating the TestMethod table
const createTestMethodTable = (req, res) => {
    testmethodModel.createTestMethodTable();
  res.status(200).json({ message: "Test Method table creation process started" });
};
// Controller to get all TestMethod
const getAllTestMethod= (req, res) => {
    testmethodModel.getAllTestMethod((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Test Method list" });
    }
    res.status(200).json(results);
  });
};
// Controller to create a TestMethod 
const createTestMethod = (req, res) => {
    const newTestMethodData = req.body;
    console.log('Received Test Method Data:', newTestMethodData); // Log the incoming data for debugging
  
    // Pass the newTestMethodData directly to the model
    testmethodModel.createTestMethod(newTestMethodData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Test Method" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Test Method added successfully", id: result.insertId });
    });
};
// Controller to update a TestMethod
const updateTestMethod = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  testmethodModel.updateTestMethod(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Test Method" });
    }
    res.status(200).json({ message: "Test Method updated successfully" });
  });
};
// Controller to delete a TestMethod
const deleteTestMethod= (req, res) => {
  const { id } = req.params;
  testmethodModel.deleteTestMethod(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Test Method" });
    }
    res.status(200).json({ message: "Test Method deleted successfully" });
  });
};
// Controller to fetch TestMethod names
const getTestMethodNames = (req, res) => {
    testmethodModel.getTestMethodNames((err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'An error occurred while fetching data' });
        }
        // Extracting only names
        const TestMethodNames = results.map(row => row.name);
        res.status(200).json(TestMethodNames);
    });
};


                                                         // TEST RESULT UNIT
// Controller for creating the TestResultUnit table
const createTestResultUnitTable = (req, res) => {
    testresultunitModel.createTestResultUnitTable();
  res.status(200).json({ message: "Test Result Unit table creation process started" });
};
// Controller to get all TestResultUnit
const getAllTestResultUnit= (req, res) => {
    testresultunitModel.getAllTestResultUnit((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Test Result Unit list" });
    }
    res.status(200).json(results);
  });
};
// Controller to create a TestResultUnit 
const createTestResultUnit = (req, res) => {
    const newTestResultUnitData = req.body;
    console.log('Received Test ResultUnit Data:', newTestResultUnitData); // Log the incoming data for debugging
  
    // Pass the newTestResultUnitData directly to the model
    testresultunitModel.createTestResultUnit(newTestResultUnitData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Test ResultUnit" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Test ResultUnit added successfully", id: result.insertId });
    });
};
// Controller to update a TestResultUnit
const updateTestResultUnit = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  testresultunitModel.updateTestResultUnit(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Test ResultUnit" });
    }
    res.status(200).json({ message: "Test ResultUnit updated successfully" });
  });
};
// Controller to delete a TestResultUnit
const deleteTestResultUnit= (req, res) => {
  const { id } = req.params;
  testresultunitModel.deleteTestResultUnit(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Test ResultUnit" });
    }
    res.status(200).json({ message: "Test Result Unit  deleted successfully" });
  });
};
// Controller to fetch TestResultUnit names
const getTestResultUnitNames = (req, res) => {
    testresultunitModel.getTestResultUnitNames((err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'An error occurred while fetching data' });
        }
        // Extracting only names
        const TestResultUnitNames = results.map(row => row.name);
        res.status(200).json(TestResultUnitNames);
    });
};

                                                         // CONCURRENT MEDICAL CONDITIONS
// Controller for creating the Concurrent Medical Conditions table
const createConcurrentMedicalConditionsTable = (req, res) => {
    concurrentmedicalconditionsModel.createConcurrentMedicalConditionsTable();
  res.status(200).json({ message: "Concurrent Medical Conditions table creation process started" });
};
// Controller to get all Concurrent Medical Conditions
const getAllConcurrentMedicalConditions= (req, res) => {
    concurrentmedicalconditionsModel.getAllConcurrentMedicalConditions((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Concurrent Medical Conditions list" });
    }
    res.status(200).json(results);
  });
};
// Controller to create a ConcurrentMedicalConditions 
const createConcurrentMedicalConditions = (req, res) => {
    const newConcurrentMedicalConditionsData = req.body;
    console.log('Received Concurrent Medical Conditions Data:', newConcurrentMedicalConditionsData); // Log the incoming data for debugging
  
    // Pass the newConcurrentMedicalConditionsData directly to the model
    concurrentmedicalconditionsModel.createConcurrentMedicalConditions(newConcurrentMedicalConditionsData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Concurrent Medical Conditions" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Concurrent Medical Conditions added successfully", id: result.insertId });
    });
};
// Controller to update a ConcurrentMedicalConditions
const updateConcurrentMedicalConditions = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  concurrentmedicalconditionsModel.updateConcurrentMedicalConditions(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Concurrent Medical Conditions " });
    }
    res.status(200).json({ message: "Concurrent Medical Conditions updated successfully" });
  });
};
// Controller to delete a ConcurrentMedicalConditions
const deleteConcurrentMedicalConditions= (req, res) => {
  const { id } = req.params;
  concurrentmedicalconditionsModel.deleteConcurrentMedicalConditions(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Concurrent Medical Conditions" });
    }
    res.status(200).json({ message: "Concurrent Medical Conditionsdeleted successfully" });
  });
};
// Controller to fetch ConcurrentMedicalConditions names
const getConcurrentMedicalConditionsNames = (req, res) => {
    concurrentmedicalconditionsModel.getConcurrentMedicalConditionsNames((err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'An error occurred while fetching data' });
        }
        // Extracting only names
        const ConcurrentMedicalConditionsNames = results.map(row => row.name);
        res.status(200).json(ConcurrentMedicalConditionsNames);
    });
};

                                                        // TEST KIT MANUFACTURER
// Controller for creating the TestKitManufacturer table
const createTestKitManufacturerTable = (req, res) => {
    testkitmanufacturerModel.createTestKitManufacturerTable();
  res.status(200).json({ message: "Test Kit Manufacturer table creation process started" });
};
// Controller to get all TestKitManufacturer
const getAllTestKitManufacturer= (req, res) => {
    testkitmanufacturerModel.getAllTestKitManufacturer((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Test Kit Manufacturer" });
    }
    res.status(200).json(results);
  });
};
// Controller to create a TestKitManufacturer 
const createTestKitManufacturer = (req, res) => {
    const newTestKitManufacturerData = req.body;
    console.log('Received Test Kit Manufacturer Data:', newTestKitManufacturerData); // Log the incoming data for debugging

    // Pass the newTestKitManufacturerData directly to the model
    testkitmanufacturerModel.createTestKitManufacturer(newTestKitManufacturerData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Test Kit Manufacturer" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Test KitManufacturer added successfully", id: result.insertId });
    });
};
// Controller to update a TestKitManufacturer
const updateTestKitManufacturer = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  testkitmanufacturerModel.updateTestKitManufacturer(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Test Kit Manufacturer" });
    }
    res.status(200).json({ message: "Test KitManufacturer updated successfully" });
  });
};
// Controller to delete a TestKitManufacturer
const deleteTestKitManufacturer= (req, res) => {
  const { id } = req.params;
  testkitmanufacturerModel.deleteTestKitManufacturer(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Test Kit Manufacturer" });
    }
    res.status(200).json({ message: "Test Kit Manufacturer  deleted successfully" });
  });
};
// Controller to fetch TestKitManufacturer names
const getTestKitManufacturerNames = (req, res) => {
    testkitmanufacturerModel.getTestKitManufacturerNames((err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'An error occurred while fetching data' });
        }
        // Extracting only names
        const TestKitManufacturerNames = results.map(row => row.name);
        res.status(200).json(TestKitManufacturerNames);
    });
};

                                                        // TEST SYSTEM
// Controller for creating the TestSystem table
const createTestSystemTable = (req, res) => {
    testsystemModel.createTestSystemTable();
  res.status(200).json({ message: "Test System table creation process started" });
};
// Controller to get all TestSystem
const getAllTestSystem= (req, res) => {
    testsystemModel.getAllTestSystem((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Test System list" });
    }
    res.status(200).json(results);
  });
};
// Controller to create a TestSystem 
const createTestSystem = (req, res) => {
    const newTestSystemData = req.body;
    console.log('Received Test System Data:', newTestSystemData); // Log the incoming data for debugging
  
    // Pass the newTestSystemData directly to the model
    testsystemModel.createTestSystem(newTestSystemData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating TestSystem" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Test System added successfully", id: result.insertId });
    });
};
// Controller to update a TestSystem
const updateTestSystem = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  testsystemModel.updateTestSystem(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Test System " });
    }
    res.status(200).json({ message: "Test System updated successfully" });
  });
};
// Controller to delete a TestSystem
const deleteTestSystem= (req, res) => {
  const { id } = req.params;
  testsystemModel.deleteTestSystem(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Test System" });
    }
    res.status(200).json({ message: "Test System deleted successfully" });
  });
};
// Controller to fetch TestSystem names
const getTestSystemNames = (req, res) => {
    testsystemModel.getTestSystemNames((err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'An error occurred while fetching data' });
        }
        // Extracting only names
        const TestSystemNames = results.map(row => row.name);
        res.status(200).json(TestSystemNames);
    });
};

                                                         // TEST SYSTEM MANUFACTURER
// Controller for creating the TestSystemManufacturer table
const createTestSystemManufacturerTable = (req, res) => {
    testsystemmanufacturerModel.createTestSystemManufacturerTable();
  res.status(200).json({ message: "Test System Manufacturer table creation process started" });
};
// Controller to get all TestSystemManufacturer
const getAllTestSystemManufacturer= (req, res) => {
    testsystemmanufacturerModel.getAllTestSystemManufacturer((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching TestSystemManufacturer list" });
    }
    res.status(200).json(results);
  });
};
// Controller to create a TestSystemManufacturer 
const createTestSystemManufacturer = (req, res) => {
    const newTestSystemManufacturerData = req.body;
    console.log('Received TestSystemManufacturer Data:', newTestSystemManufacturerData); // Log the incoming data for debugging
  
    // Pass the newTestSystemManufacturerData directly to the model
    testsystemmanufacturerModel.createTestSystemManufacturer(newTestSystemManufacturerData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating TestSystemManufacturer" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Test System Manufacturer added successfully", id: result.insertId });
    });
};
// Controller to UPDATE a TestSystemManufacturer
const updateTestSystemManufacturer = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  testsystemmanufacturerModel.updateTestSystemManufacturer(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Test System Manufacturer " });
    }
    res.status(200).json({ message: "Test System Manufacturerupdated successfully" });
  });
};
// Controller to delete a TestSystemManufacturer
const deleteTestSystemManufacturer= (req, res) => {
  const { id } = req.params;
  testsystemmanufacturerModel.deleteTestSystemManufacturer(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Test System Manufacturer" });
    }
    res.status(200).json({ message: "Test System Manufacturer deleted successfully" });
  });
};
// Controller to fetch TestSystemManufacturer names
const getTestSystemManufacturerNames = (req, res) => {
    testsystemmanufacturerModel.getTestSystemManufacturerNames((err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'An error occurred while fetching data' });
        }
        // Extracting only names
        const TestSystemManufacturerNames = results.map(row => row.name);
        res.status(200).json(TestSystemManufacturerNames);
    });
};


module.exports = {
  createEthnicityTable, getAllEthnicity, createEthnicity, updateEthnicity, deleteEthnicity, getEthnicityNames,

  createSampleConditionTable, getAllSampleCondition, createSampleCondition, updateSampleCondition, deleteSampleCondition, getSampleConditionNames,

  createStorageTemperatureTable, getAllStorageTemperature, createStorageTemperature, updateStorageTemperature, deleteStorageTemperature, getStorageTemperatureNames,

  createContainerTypeTable, getAllContainerType, createContainerType, updateContainerType, deleteContainerType, getContainerTypeNames,

  createQuantityUnitTable, getAllQuantityUnit, createQuantityUnit, updateQuantityUnit, deleteQuantityUnit, getQuantityUnitNames,

  createSampleTypeMatrixTable, getAllSampleTypeMatrix, createSampleTypeMatrix, updateSampleTypeMatrix, deleteSampleTypeMatrix, getSampleTypeMatrixNames,

  createTestMethodTable, getAllTestMethod, createTestMethod, updateTestMethod, deleteTestMethod, getTestMethodNames,

  createTestResultUnitTable, getAllTestResultUnit, createTestResultUnit, updateTestResultUnit, deleteTestResultUnit, getTestResultUnitNames,

  createConcurrentMedicalConditionsTable, getAllConcurrentMedicalConditions, createConcurrentMedicalConditions, updateConcurrentMedicalConditions, deleteConcurrentMedicalConditions, getConcurrentMedicalConditionsNames,

  createTestKitManufacturerTable, getAllTestKitManufacturer, createTestKitManufacturer, updateTestKitManufacturer, deleteTestKitManufacturer, getTestKitManufacturerNames,

  createTestSystemTable, getAllTestSystem, createTestSystem, updateTestSystem, deleteTestSystem, getTestSystemNames,

  createTestSystemManufacturerTable, getAllTestSystemManufacturer, createTestSystemManufacturer, updateTestSystemManufacturer, deleteTestSystemManufacturer, getTestSystemManufacturerNames,
};
