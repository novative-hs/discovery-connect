const UserAccountModel = require('../models/useraccountModel');

// Controller to change  password
const changepassword = (req, res) => {
  const { email, password, newPassword } = req.body;

  if (!email || !password || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const userData = { email, password, newPassword };

  UserAccountModel.changepassword(userData, (err, result) => {
    if (err) {
      return res.status(err.status || 500).json({ message: err.message });
    }
    res.status(200).json(result);
  });
};


module.exports = {
  changepassword,
  
};