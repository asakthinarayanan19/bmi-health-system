const { Users, Assessments, Contacts } = require('../db');

exports.getAdminData = async (req, res) => {
  try {
    const allUsers = await Users.findAll();
    const allAssessments = await Assessments.findAll();
    const allContacts = await Contacts.findAll();

    // Compute basic statistics
    const stats = {
      totalUsers: allUsers.length,
      totalAssessments: allAssessments.length,
      totalContacts: allContacts.length,
      averageBmi: 0,
      averageHealthScore: 0
    };

    if (allAssessments.length > 0) {
      const sumBmi = allAssessments.reduce((acc, a) => acc + (a.bmi || 0), 0);
      const sumScore = allAssessments.reduce((acc, a) => acc + (a.healthScore || 0), 0);
      stats.averageBmi = parseFloat((sumBmi / allAssessments.length).toFixed(2));
      stats.averageHealthScore = Math.round(sumScore / allAssessments.length);
    }

    res.status(200).json({
      success: true,
      stats,
      users: allUsers,
      assessments: allAssessments,
      contacts: allContacts
    });
  } catch (err) {
    console.error('Get admin data error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving admin statistics.' });
  }
};

exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please complete all contact form fields.' });
    }

    const contact = await Contacts.create({ name, email, message });
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully! Our health expert will contact you shortly.',
      contact
    });
  } catch (err) {
    console.error('Submit contact error:', err);
    res.status(500).json({ success: false, message: 'Server error submitting contact form.' });
  }
};
