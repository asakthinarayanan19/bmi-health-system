const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Users } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_987654';

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    // Check if user exists
    const existingUser = await Users.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await Users.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    // Sign JWT
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        gender: newUser.gender,
        age: newUser.age,
        weight: newUser.weight,
        height: newUser.height,
        activityLevel: newUser.activityLevel,
        goal: newUser.goal,
        monthlyBudget: newUser.monthlyBudget,
        hostelMode: newUser.hostelMode,
        challenges: newUser.challenges,
        achievements: newUser.achievements
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await Users.findByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    // Sign JWT
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        age: user.age,
        weight: user.weight,
        height: user.height,
        activityLevel: user.activityLevel,
        goal: user.goal,
        monthlyBudget: user.monthlyBudget,
        hostelMode: user.hostelMode,
        challenges: user.challenges,
        achievements: user.achievements
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        age: user.age,
        weight: user.weight,
        height: user.height,
        activityLevel: user.activityLevel,
        goal: user.goal,
        monthlyBudget: user.monthlyBudget,
        hostelMode: user.hostelMode,
        challenges: user.challenges,
        achievements: user.achievements
      }
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Server error loading profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updated = await Users.updateById(req.user.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        gender: updated.gender,
        age: updated.age,
        weight: updated.weight,
        height: updated.height,
        activityLevel: updated.activityLevel,
        goal: updated.goal,
        monthlyBudget: updated.monthlyBudget,
        hostelMode: updated.hostelMode,
        challenges: updated.challenges,
        achievements: updated.achievements
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email.' });
    }

    const user = await Users.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email not found.' });
    }

    // Simulated action for forgot password (returns successful mock message in standard implementation)
    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to your email (simulated).'
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error during forgot password request.' });
  }
};
