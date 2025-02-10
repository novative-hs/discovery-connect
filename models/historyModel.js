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
      status ENUM('active', 'inactive', 'unapproved') DEFAULT 'active',
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

  if (filterType === "city") {
    query = "SELECT * FROM RegistrationAdmin_History WHERE city_id = ?";
  } else if (filterType === "district") {
    query = "SELECT * FROM RegistrationAdmin_History WHERE district_id = ?";
  } else if (filterType === "country") {
    query = "SELECT * FROM RegistrationAdmin_History WHERE country_id = ?";
  }
  else if (filterType === "organization") {
    query = "SELECT * FROM RegistrationAdmin_History WHERE organization_id = ?";
  }
  else if (filterType === "researcher") {
    query = "SELECT * FROM RegistrationAdmin_History WHERE researcher_id = ?";
  }
  else if (filterType === "collectionsite") {
    query = "SELECT * FROM RegistrationAdmin_History WHERE collectionsite_id = ?";
  } else {
    return callback(new Error("Invalid filter type"), null);
  }

  mysqlConnection.query(query, [id], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};


module.exports = {
  RegistrationAdmin_History,
  getHistory,

};