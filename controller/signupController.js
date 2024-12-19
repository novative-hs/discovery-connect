const signupModel = require("../models/signupModel");

function userSignup(req, res) {
  const {
    accountType,
    email,
    password,
    confirmPassword,
    ResearcherName,
    OrganizationName,
    CollectionSiteName,
    phoneNumber,
    fullAddress,
    city,
    district,
    country,
    nameofOrganization,
    type,
    HECPMDCRegistrationNo,
    ntnNumber,
  } = req.body;

  if (!email || !password || !confirmPassword || !accountType) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  const userData = { email, password, confirmPassword, accountType };

  signupModel.createUserAccount(userData, (err, userAccountResults) => {
    if (err) {
      console.error("Error creating user account:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    const userAccountId = userAccountResults.insertId;

    const accountData = {
      ResearcherName,
      OrganizationName,
      CollectionSiteName,
      phoneNumber,
      fullAddress,
      city,
      district,
      country,
      nameofOrganization,
      type,
      HECPMDCRegistrationNo,
      ntnNumber,
      email,
      password,
      confirmPassword,
    };

    signupModel.createAccountDetails(accountType, userAccountId, accountData, (err, accountResults) => {
      if (err) {
        console.error("Error creating account details:", err);
        return res.status(500).json({ error: "Database query failed" });
      }

      res.status(201).json({
        message: "User registered successfully",
        userId: accountResults.insertId,
      });
    });
  });
}

module.exports = {
  userSignup,
};
