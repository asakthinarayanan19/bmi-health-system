const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Determine path for JSON fallback DB
const DB_DIR = path.join(__dirname, 'data');
const JSON_DB_PATH = path.join(DB_DIR, 'local_db.json');

// Global state tracking connection type
let dbType = 'mongodb'; // 'mongodb' or 'json'

// Ensure data folder exists for fallback
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial structure for JSON Database
const initialJsonDb = {
  users: [],
  assessments: [],
  contacts: []
};

// Initialize JSON database file if it does not exist
if (!fs.existsSync(JSON_DB_PATH)) {
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(initialJsonDb, null, 2), 'utf8');
}

// Helper functions for JSON database operations
function readJsonDb() {
  try {
    const data = fs.readFileSync(JSON_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON DB, reinitializing:', err);
    return initialJsonDb;
  }
}

function writeJsonDb(data) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing to JSON DB:', err);
    return false;
  }
}

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  gender: { type: String, default: 'Male' },
  age: { type: Number, default: 25 },
  weight: { type: Number, default: 70 },
  height: { type: Number, default: 170 },
  activityLevel: { type: String, default: 'Moderately Active' },
  goal: { type: String, default: 'Maintain Weight' },
  monthlyBudget: { type: Number, default: 200 },
  hostelMode: { type: Boolean, default: false },
  challenges: {
    water: { type: Boolean, default: false },
    steps: { type: Boolean, default: false },
    noSugar: { type: Boolean, default: false },
    protein: { type: Boolean, default: false },
    streak: { type: Number, default: 0 },
    lastUpdated: { type: String, default: '' }
  },
  achievements: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const AssessmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  activityLevel: { type: String, required: true },
  goal: { type: String, required: true },
  bmi: { type: Number, required: true },
  bmiCategory: { type: String, required: true },
  bmr: { type: Number, required: true },
  tdee: { type: Number, required: true },
  bodyFat: { type: Number, required: true },
  lbm: { type: Number, required: true },
  calories: { type: Number, required: true },
  water: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  healthScore: { type: Number, required: true },
  biologicalAge: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

let UserModel, AssessmentModel, ContactModel;

// Connection helper
async function connectDb() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bmi_health_twin';
  console.log(`Connecting to MongoDB at: ${mongoUri}...`);
  try {
    // Set short timeout to quickly fail and drop to JSON mode if Mongo is unavailable
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    console.log('Successfully connected to MongoDB Atlas / Local MongoDB!');
    dbType = 'mongodb';
    UserModel = mongoose.model('User', UserSchema);
    AssessmentModel = mongoose.model('Assessment', AssessmentSchema);
    ContactModel = mongoose.model('Contact', ContactSchema);
  } catch (err) {
    console.warn('\n======================================================');
    console.warn('WARNING: MongoDB Connection Failed!');
    console.warn('Falling back to local JSON database at:', JSON_DB_PATH);
    console.warn('======================================================\n');
    dbType = 'json';
  }
}

// Unified API Wrapper
const Users = {
  async create(userData) {
    if (dbType === 'mongodb') {
      const user = new UserModel(userData);
      return await user.save();
    } else {
      const db = readJsonDb();
      const newUser = {
        _id: crypto.randomUUID(),
        email: userData.email,
        password: userData.password,
        name: userData.name,
        gender: userData.gender || 'Male',
        age: userData.age || 25,
        weight: userData.weight || 70,
        height: userData.height || 170,
        activityLevel: userData.activityLevel || 'Moderately Active',
        goal: userData.goal || 'Maintain Weight',
        monthlyBudget: userData.monthlyBudget || 200,
        hostelMode: userData.hostelMode || false,
        challenges: userData.challenges || {
          water: false,
          steps: false,
          noSugar: false,
          protein: false,
          streak: 0,
          lastUpdated: ''
        },
        achievements: userData.achievements || [],
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      writeJsonDb(db);
      return newUser;
    }
  },

  async findByEmail(email) {
    if (dbType === 'mongodb') {
      return await UserModel.findOne({ email: email.toLowerCase() });
    } else {
      const db = readJsonDb();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return user || null;
    }
  },

  async findById(id) {
    if (dbType === 'mongodb') {
      return await UserModel.findById(id);
    } else {
      const db = readJsonDb();
      const user = db.users.find(u => u._id === id);
      return user || null;
    }
  },

  async updateById(id, updateData) {
    if (dbType === 'mongodb') {
      return await UserModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    } else {
      const db = readJsonDb();
      const userIndex = db.users.findIndex(u => u._id === id);
      if (userIndex === -1) return null;

      // Deep merges for nested structures like challenges
      const user = db.users[userIndex];
      
      // Update individual fields
      for (const key in updateData) {
        if (key === 'challenges' && typeof updateData.challenges === 'object') {
          user.challenges = { ...user.challenges, ...updateData.challenges };
        } else {
          user[key] = updateData[key];
        }
      }
      
      db.users[userIndex] = user;
      writeJsonDb(db);
      return user;
    }
  },

  async findAll() {
    if (dbType === 'mongodb') {
      return await UserModel.find({}, '-password');
    } else {
      const db = readJsonDb();
      return db.users.map(({ password, ...u }) => u);
    }
  }
};

const Assessments = {
  async create(assessmentData) {
    if (dbType === 'mongodb') {
      const assessment = new AssessmentModel(assessmentData);
      return await assessment.save();
    } else {
      const db = readJsonDb();
      const newAssessment = {
        _id: crypto.randomUUID(),
        ...assessmentData,
        createdAt: new Date().toISOString()
      };
      db.assessments.push(newAssessment);
      writeJsonDb(db);
      return newAssessment;
    }
  },

  async findByUserId(userId) {
    if (dbType === 'mongodb') {
      return await AssessmentModel.find({ userId }).sort({ createdAt: -1 });
    } else {
      const db = readJsonDb();
      const assessments = db.assessments
        .filter(a => a.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return assessments;
    }
  },

  async findAll() {
    if (dbType === 'mongodb') {
      return await AssessmentModel.find().sort({ createdAt: -1 });
    } else {
      const db = readJsonDb();
      return db.assessments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }
};

const Contacts = {
  async create(contactData) {
    if (dbType === 'mongodb') {
      const contact = new ContactModel(contactData);
      return await contact.save();
    } else {
      const db = readJsonDb();
      const newContact = {
        _id: crypto.randomUUID(),
        ...contactData,
        createdAt: new Date().toISOString()
      };
      db.contacts.push(newContact);
      writeJsonDb(db);
      return newContact;
    }
  },

  async findAll() {
    if (dbType === 'mongodb') {
      return await ContactModel.find().sort({ createdAt: -1 });
    } else {
      const db = readJsonDb();
      return db.contacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }
};

module.exports = {
  connectDb,
  getDbType: () => dbType,
  Users,
  Assessments,
  Contacts
};
