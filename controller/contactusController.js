const contactusModel = require("../models/contactusModel");

const submitContactForm = (req, res) => {
    const { name, email, phone, company, message } = req.body;

    if (!name || !email || !phone || !company || !message) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const formData = { name, email, phone, company, message };

    contactusModel.saveContactUs(formData, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({ message: err.message });
        }
        return res.status(200).json(result);
    });
};

module.exports = {
    submitContactForm
};
