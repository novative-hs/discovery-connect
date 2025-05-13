const mysqlConnection = require("../config/db");

const registrationadmin_history = () => {
  const createregistrationadmin_historyTable = `
    CREATE TABLE IF NOT EXISTS registrationadmin_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      created_name VARCHAR(255),
      updated_name VARCHAR(255),
      added_by INT,
      organization_id INT,
      collectionsite_id INT,
      researcher_id INT,
      city_id INT,
      country_id INT,
      district_id INT,
      sample_id VARCHAR(36),
      csr_id  INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive', 'unapproved', 'approved','pending') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      ethnicity_id INT,
      samplecondition_id INT,
      storagetemperature_id INT,
      containertype_id INT,
      quantityunit_id INT,
      sampletypematrix_id INT,
      testmethod_id INT,
      testresultunit_id INT,
      concurrentmedicalconditions_id INT,
      testkitmanufacturer_id INT,
      testsystem_id INT,
      testsystemmanufacturer_id INT,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE,
      FOREIGN KEY (organization_id) REFERENCES organization(id) ON DELETE CASCADE,
      FOREIGN KEY (collectionsite_id) REFERENCES collectionsite(id) ON DELETE CASCADE,
      FOREIGN KEY (csr_id) REFERENCES csr(id) ON DELETE CASCADE,
      FOREIGN KEY (researcher_id) REFERENCES researcher(id) ON DELETE CASCADE,
      FOREIGN KEY (sample_id) REFERENCES sample(id) ON DELETE CASCADE,
      FOREIGN KEY (city_id) REFERENCES city(id) ON DELETE CASCADE,
      FOREIGN KEY (country_id) REFERENCES country(id) ON DELETE CASCADE,
      FOREIGN KEY (district_id) REFERENCES district(id) ON DELETE CASCADE,
      FOREIGN KEY (ethnicity_id) REFERENCES ethnicity(id) ON DELETE CASCADE,
      FOREIGN KEY (samplecondition_id) REFERENCES samplecondition(id) ON DELETE CASCADE,
      FOREIGN KEY (storagetemperature_id) REFERENCES storagetemperature(id) ON DELETE CASCADE,
      FOREIGN KEY (containertype_id) REFERENCES containertype(id) ON DELETE CASCADE,
      FOREIGN KEY (quantityunit_id) REFERENCES quantityunit(id) ON DELETE CASCADE,
      FOREIGN KEY (sampletypematrix_id) REFERENCES sampletypematrix(id) ON DELETE CASCADE,
      FOREIGN KEY (testmethod_id) REFERENCES testmethod(id) ON DELETE CASCADE,
      FOREIGN KEY (testresultunit_id) REFERENCES testresultunit(id) ON DELETE CASCADE,
      FOREIGN KEY (concurrentmedicalconditions_id) REFERENCES concurrentmedicalconditions(id) ON DELETE CASCADE,
      FOREIGN KEY (testkitmanufacturer_id) REFERENCES testkitmanufacturer(id) ON DELETE CASCADE,
      FOREIGN KEY (testsystem_id) REFERENCES testsystem(id) ON DELETE CASCADE,
      FOREIGN KEY (testsystemmanufacturer_id) REFERENCES testsystemmanufacturer(id) ON DELETE CASCADE
    )`;


  mysqlConnection.query(createregistrationadmin_historyTable, (err, results) => {
    if (err) {
      console.error("Error creating History table: ", err);
    } else {
      console.log("Registration Admin History table created Successfully");
    }
  });
};

const getHistory = (filterType, id, callback) => {
  if (!filterType || !id)
    return callback(new Error("Invalid parameters"), null);
  column = `${filterType}_id`;
  if (!column) return callback(new Error("Invalid filter type"), null);

  const query = `SELECT * FROM registrationadmin_history WHERE ${column} = ?`;

  mysqlConnection.query(query, [id], (err, results) => {
    if (err || results.length === 0) {
      // If an error occurs or no results found, run the fallback query
      const fallbackQuery = `
        SELECT history.*, city.name AS city_name, district.name AS district_name,
               country.name AS country_name, organization.OrganizationName AS organization_name,cnic,
               user_account.email AS added_by
        FROM history
        LEFT JOIN city ON history.city = city.id
        LEFT JOIN district ON history.district = district.id
        LEFT JOIN country ON history.country = country.id
        LEFT JOIN organization ON history.nameofOrganization = organization.id
        LEFT JOIN user_account ON history.added_by = user_account.id
        WHERE history.${column} = ?;
      `;

      mysqlConnection.query(
        fallbackQuery,
        [id],
        (fallbackErr, fallbackResults) => {
          return callback(fallbackErr, fallbackResults);
        }
      );
    } else {
      return callback(null, results);
    }
  });
};

const create_historyTable = () => {
  const create_historyTable = `
  CREATE TABLE IF NOT EXISTS history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    password VARCHAR(255),
    ResearcherName VARCHAR(100) NULL,
    CollectionSiteName VARCHAR(100) NULL,
    CommitteeMemberName VARCHAR(100) NULL,
    OrganizationName VARCHAR(100) NULL,
    CSRName VARCHAR(100) NULL,
    HECPMDCRegistrationNo VARCHAR(50),
    cnic VARCHAR(50),
    CommitteeType VARCHAR(50),
    ntnNumber VARCHAR(50),
    nameofOrganization INT,
    type VARCHAR(50),
    CollectionSiteType VARCHAR(50),
    phoneNumber VARCHAR(15),
    fullAddress TEXT,
    city INT,
    district INT,
    country INT,
    logo LONGBLOB,
    organization_id INT,
    collectionsite_id INT,
    committeemember_id INT,
    researcher_id INT,
    csr_id INT,
    sample_id VARCHAR(36),
    added_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('added', 'updated', 'deleted') DEFAULT 'added',
    FOREIGN KEY (city) REFERENCES city(id) ON DELETE CASCADE,
    FOREIGN KEY (district) REFERENCES district(id) ON DELETE CASCADE,
    FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organization(id) ON DELETE CASCADE,
    FOREIGN KEY (collectionsite_id) REFERENCES collectionsite(id) ON DELETE CASCADE,
    FOREIGN KEY (csr_id) REFERENCES csr(id) ON DELETE CASCADE,
    FOREIGN KEY (committeemember_id) REFERENCES committee_member(id) ON DELETE CASCADE,
    FOREIGN KEY (researcher_id) REFERENCES researcher(id) ON DELETE CASCADE,
    FOREIGN KEY (sample_id) REFERENCES sample(id) ON DELETE CASCADE
  )`;

  mysqlConnection.query(create_historyTable, (err, results) => {
    if (err) {
      console.error("Error creating History table: ", err);
    } else {
      console.log("History table created successfully");
    }
  });
};

const create_samplehistoryTable = () => {
  const create_historyTable = `
  CREATE TABLE IF NOT EXISTS sample_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sample_id VARCHAR(36) NOT NULL,
    status VARCHAR(50),
    comments TEXT, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sample_id) REFERENCES sample(id) ON DELETE CASCADE
  )`;

  mysqlConnection.query(create_historyTable, (err, results) => {
    if (err) {
      console.error("Error creating Sample History table: ", err); 
    } else {
      console.log("Sample History table created or already exists"); 
    }
  });
};


const getSampleHistory = (sampleId, callback) => {
  const query = `
    SELECT 
      sh.id AS history_id,
      sh.sample_id,
      sh.comments AS comments,
      CAST(sh.updated_at AS CHAR) AS updated_at,
      s.samplename,
      s.age,
      s.gender,
      s.ethnicity,
      s.samplecondition,
      s.storagetemp,
      s.ContainerType,
      s.CountryOfCollection,
      s.price,
      s.SamplePriceCurrency,
      s.quantity,
      s.QuantityUnit,
      s.SampleTypeMatrix,
      s.SmokingStatus,
      s.AlcoholOrDrugAbuse,
      s.InfectiousDiseaseTesting,
      s.InfectiousDiseaseResult,
      s.FreezeThawCycles,
      s.DateOfCollection,
      s.ConcurrentMedicalConditions,
      s.ConcurrentMedications,
      s.DiagnosisTestParameter,
      s.TestResult,
      s.TestResultUnit,
      s.TestMethod,
      s.TestKitManufacturer,
      s.TestSystem,
      s.TestSystemManufacturer,
      s.status AS sample_status,
      CAST(s.created_at AS CHAR) AS created_at 
    FROM sample_history sh
    JOIN sample s ON sh.sample_id = s.id
    WHERE sh.sample_id = ?`;

  mysqlConnection.query(query, [sampleId], (err, results) => {
    if (err) {
      console.error("Error fetching sample history with sample details: ", err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};


module.exports = {
  registrationadmin_history,
  getHistory,
  create_historyTable,
  create_samplehistoryTable,
  getSampleHistory
};

