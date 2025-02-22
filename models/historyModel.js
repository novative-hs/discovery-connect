const mysqlConnection = require("../config/db");

const RegistrationAdmin_History = () => {
  const createRegistrationAdmin_HistoryTable = `
    CREATE TABLE IF NOT EXISTS RegistrationAdmin_History (
      id INT AUTO_INCREMENT PRIMARY KEY,
      created_name VARCHAR(255),
      updated_name VARCHAR(255),
      added_by INT,
      organization_id INT,
      collectionsite_id INT,
      resaercher_id INT,
      city_id INT,
      country_id INT,
      district_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive', 'unapproved', 'approved') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE,
      FOREIGN KEY (organization_id) REFERENCES organization(id) ON DELETE CASCADE,
      FOREIGN KEY (collectionsite_id) REFERENCES collectionsite(id) ON DELETE CASCADE,
      FOREIGN KEY (resaercher_id) REFERENCES researcher(id) ON DELETE CASCADE,
      FOREIGN KEY (city_id) REFERENCES city(id) ON DELETE CASCADE,
      FOREIGN KEY (country_id) REFERENCES country(id) ON DELETE CASCADE,
      FOREIGN KEY (district_id) REFERENCES district(id) ON DELETE CASCADE
    )`;


  mysqlConnection.query(createRegistrationAdmin_HistoryTable, (err, results) => {
    if (err) {
      console.error("Error creating History table: ", err);
    } else {
      console.log("Registration Admin History table created Successfully");
    }
  });
};

const getHistory = (filterType, id, callback) => {
  let query = "";
  let params = [id];
  const column = `${filterType}_id`;

  if (filterType ) {
    query = `SELECT * FROM RegistrationAdmin_History WHERE ${column} = ?`;
  } 
  else {
    return callback(new Error("Invalid filter type"), null);
  }

  mysqlConnection.query(query, params, (err, results) => {
    if (err) {
      return callback(err, null);
    }
    // If no results in RegistrationAdmin_History, fallback to the history table
    if (results.length === 0) {
      let fallbackQuery = `
        SELECT 
    history.*,
    city.name AS city_name,
    district.name AS district_name,
    country.name AS country_name,
    organization.OrganizationName AS organization_name,
    user_account.email AS added_by
FROM history
LEFT JOIN city ON history.city = city.id
LEFT JOIN district ON history.district = district.id
LEFT JOIN country ON history.country = country.id
LEFT JOIN organization ON history.nameofOrganization = organization.id
LEFT JOIN user_account ON history.added_by = user_account.id
WHERE history.${filterType}_id = ?;
      `;
      mysqlConnection.query(
        fallbackQuery,
        params,
        (fallbackErr, fallbackResults) => {
          if (fallbackErr) {
            return callback(fallbackErr, null);
          }
          console.log(fallbackResults);
          callback(null, fallbackResults);
        }
      );

    } else {
      callback(null, results);
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
    OrganizationName VARCHAR(100) NULL,
    HECPMDCRegistrationNo VARCHAR(50),
    ntnNumber VARCHAR(50),
    nameofOrganization INT,
    type VARCHAR(50),
    phoneNumber VARCHAR(15),
    fullAddress TEXT,
    city INT,
    district INT,
    country INT,
    logo LONGBLOB,
    organization_id INT,
    collectionsite_id INT,
    researcher_id INT,
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
    FOREIGN KEY (researcher_id) REFERENCES researcher(id) ON DELETE CASCADE
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
  CREATE TABLE sample_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donorID VARCHAR(50),
    masterID BIGINT,
    user_account_id INT,
    samplename VARCHAR(100),
    age INT,
    gender VARCHAR(10),
    ethnicity VARCHAR(50),
    samplecondition VARCHAR(100),
    storagemp VARCHAR(255),
    ContainerType VARCHAR(50),
    CountryOfCollection VARCHAR(50),
    price FLOAT,
    SamplePriceCurrency VARCHAR(255),
    quantity FLOAT,
    QuantityUnit VARCHAR(20),
    SampleTypeMatrix VARCHAR(100),
    SmokingStatus VARCHAR(50),
    AlcoholOrDrugAbuse VARCHAR(50),
    InfectiousDiseaseTesting VARCHAR(100),
    InfectiousDiseaseResult VARCHAR(100),
    FreezeThawCycles VARCHAR(50),
    DateOfCollection VARCHAR(50),
    ConcurrentMedicalConditions INT,
    ConcurrentMedications INT,
    DiagnosisTestParameter VARCHAR(50),
     TestResult INT,
    TestResultUnit INT,
    TestMethod INT,
    TestKitManufacturer INT,
    TestSystem INT,
    TestSystemManufacturer INT
    logo LONGBLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('added', 'updated', 'deleted')
)`;

  mysqlConnection.query(create_historyTable, (err, results) => {
    if (err) {
      console.error("Error creating Sample History table: ", err);
    } else {
      console.log("Sample History table created successfully");
    }
  });
}
module.exports = {
  RegistrationAdmin_History,
  getHistory,
  create_historyTable,
  create_samplehistoryTable
};

