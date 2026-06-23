// Configuration
const API_URL = window.location.origin;

// State Management
let isOffline = false;
let currentUser = null;
let currentToken = null;
let assessmentHistory = [];
let activeTab = 'dashboard';

// Charts Instances
let radarChartInstance = null;
let simulatorChartInstance = null;
let macroChartInstance = null;

// Food Swap Database
const foodSwaps = [
  { original: 'Pizza', replacement: 'Cauliflower Crust Pizza', calories: '850 kcal → 380 kcal', carbs: '110g → 24g', protein: '22g → 30g', details: 'Saves 470 calories and slashes carbohydrates while boosting protein.' },
  { original: 'Burger', replacement: 'Grilled Chicken Lettuce Wrap', calories: '620 kcal → 280 kcal', carbs: '48g → 6g', protein: '25g → 32g', details: 'Removes the high-glycemic bun, significantly lowering fat and calories.' },
  { original: 'Soft Drink / Soda', replacement: 'Stevia-Sweetened Sparkling Water or Coconut Water', calories: '150 kcal → 45 kcal', carbs: '39g → 9g', protein: '0g → 1g', details: 'Avoids insulin spikes and high-fructose corn syrup.' },
  { original: 'French Fries', replacement: 'Air-Fried Sweet Potato Wedges', calories: '400 kcal → 160 kcal', carbs: '44g → 22g', protein: '4g → 3g', details: 'Rich in Vitamin A and fiber. Cuts down saturated frying oils.' },
  { original: 'Ice Cream', replacement: 'Greek Yogurt with Blueberries & Honey', calories: '280 kcal → 120 kcal', carbs: '32g → 14g', protein: '3g → 15g', details: 'Provides essential probiotics and a huge protein boost.' },
  { original: 'White Rice', replacement: 'Quinoa or Cauliflower Rice', calories: '200 kcal → 120 kcal', carbs: '45g → 21g', protein: '4g → 8g', details: 'Increases dietary fiber, minerals, and provides a complete amino acid profile.' }
];

// Symptoms Database
const deficienciesDb = {
  fatigue: { name: 'Iron Deficiency', suggestions: 'Incorporate spinach, red meat, lentils, and Vitamin C (for absorption).' },
  weakness: { name: 'Protein Deficiency', suggestions: 'Increase intake of eggs, chicken breast, Greek yogurt, whey, or tofu.' },
  hair: { name: 'Zinc & Biotin Deficiency', suggestions: 'Eat pumpkin seeds, eggs, almonds, and lean meats.' },
  cramps: { name: 'Magnesium Deficiency', suggestions: 'Consume pumpkin seeds, dark chocolate, almonds, and avocados.' },
  aches: { name: 'Vitamin D & Calcium Deficiency', suggestions: 'Spend time in sunlight, eat egg yolks, fatty fish, and fortified dairy.' },
  skin: { name: 'Omega-3 Fatty Acid Deficiency', suggestions: 'Add walnuts, chia seeds, flaxseeds, and salmon to your diet.' }
};

// Meal Plans Database by Goal and Hostel Toggle
const mealPlans = {
  'Weight Loss': {
    standard: {
      breakfast: 'Oatmeal (50g oats, 200ml skimmed milk) topped with 10 almonds & blueberries. 2 boiled egg whites. (350 kcal)',
      lunch: 'Grilled Chicken Salad (150g breast) with mixed greens, cherry tomatoes, cucumbers, and 1 tsp olive oil. (400 kcal)',
      dinner: 'Baked Salmon (120g) served with steamed broccoli and half a baked sweet potato. (380 kcal)',
      snacks: 'A medium apple or pear with 1 cup of plain green tea. (90 kcal)'
    },
    hostel: {
      breakfast: 'Boiled Oats (50g) in water/milk with 1 sliced banana & 1 tbsp peanut butter. (380 kcal)',
      lunch: 'Mess Dal Tadka (1.5 cups) with 1 roti and a side of green cucumber salad. (420 kcal)',
      dinner: 'Paneer Bhurji (100g low-fat paneer) cooked with minimal oil, served with 1 slice of whole wheat toast. (350 kcal)',
      snacks: 'Roasted Chana / Chickpeas (30g) or 2 boiled eggs (discard 1 yolk). (130 kcal)'
    }
  },
  'Maintain Weight': {
    standard: {
      breakfast: '3 scrambled eggs with spinach, served on 2 slices of whole grain sourdough toast. 1 orange. (520 kcal)',
      lunch: 'Turkey & Avocado Wrap in a whole wheat tortilla with tomatoes, lettuce, and a side of hummus. (580 kcal)',
      dinner: 'Lean Sirloin Beef (150g) stir-fried with mixed vegetables (peppers, snap peas) and 1 cup brown rice. (600 kcal)',
      snacks: 'Greek Yogurt (150g) with 1 tbsp honey and 15g walnuts. (220 kcal)'
    },
    hostel: {
      breakfast: '3 whole boiled eggs with salt and pepper, 2 slices of whole wheat bread with butter. (450 kcal)',
      lunch: 'Standard Hostel Rice (1.5 cups) served with Dal (1 cup), Aloo Gobi subji, and curd/yogurt. (580 kcal)',
      dinner: 'Soya Chunks Curry (70g dry soya) prepared with mess spices, served with 2 rotis. (550 kcal)',
      snacks: 'Peanut Butter Sandwich (2 slices of bread + 1.5 tbsp peanut butter) and a glass of milk. (380 kcal)'
    }
  },
  'Weight Gain': {
    standard: {
      breakfast: 'Protein Smoothie: 1 scoop whey, 1 banana, 2 tbsp peanut butter, 30g oats, 300ml whole milk. (780 kcal)',
      lunch: 'Chicken & Rice Bowl: 200g grilled breast, 1.5 cups jasmine rice, half avocado, and sweet corn. (750 kcal)',
      dinner: 'Baked Mackerel / Salmon (180g) with roasted baby potatoes, asparagus, and 2 tsp olive oil drizzle. (700 kcal)',
      snacks: 'Trail mix (50g nuts and dried fruits) + 1 glass whole milk. (350 kcal)'
    },
    hostel: {
      breakfast: 'Double Peanut Butter Banana Sandwich (4 slices + 2 tbsp PB) and a large banana. (720 kcal)',
      lunch: 'Hostel Mess Meal: Rice (2 cups), Dal (1.5 cups), Paneer/Egg Curry, and 1 roti with ghee. (820 kcal)',
      dinner: 'Egg Bhurji (4 eggs) cooked with butter, served with 2 rotis and a side of boiled potatoes. (750 kcal)',
      snacks: 'Roasted Peanuts (50g) with a glass of whole milk and honey. (450 kcal)'
    }
  }
};

// Unified Alert Helper
function showAlert(text, type = 'success') {
  const container = document.getElementById('alert-container');
  if (!container) return;
  const alert = document.createElement('div');
  alert.className = `alert-popup ${type}`;
  alert.innerHTML = text;
  container.appendChild(alert);
  setTimeout(() => alert.remove(), 4000);
}

// -------------------------------------------------------------
// INITIALIZATION ROUTINES & OFFLINE DETECTION
// -------------------------------------------------------------
async function initApp() {
  currentToken = localStorage.getItem('ht_token');
  const offlineUserStr = localStorage.getItem('ht_offline_user');

  // Verify connection to Express backend API
  try {
    const res = await fetch(`${API_URL}/api/health`);
    const data = await res.json();
    if (data.success) {
      isOffline = false;
      document.getElementById('status-dot').className = 'status-dot online';
      document.getElementById('status-text').innerText = 'Online Mode';
    } else {
      throw new Error();
    }
  } catch (err) {
    isOffline = true;
    document.getElementById('status-dot').className = 'status-dot offline';
    document.getElementById('status-text').innerText = 'Offline Mode (Local)';
  }

  // Handle Authentication Validation
  if (isOffline) {
    if (offlineUserStr) {
      currentUser = JSON.parse(offlineUserStr);
    } else {
      showAlert('No active offline session. Redirecting to Login...', 'error');
      setTimeout(() => window.location.href = 'index.html', 1500);
      return;
    }
  } else {
    if (currentToken) {
      // Load user profile via API
      try {
        const res = await fetch(`${API_URL}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        const data = await res.json();
        if (data.success) {
          currentUser = data.user;
        } else {
          throw new Error('Token verification failed');
        }
      } catch (err) {
        localStorage.removeItem('ht_token');
        window.location.href = 'index.html';
        return;
      }
    } else {
      window.location.href = 'index.html';
      return;
    }
  }

  // Display greeting
  showAlert(`Welcome back, ${currentUser.name}!`, 'success');

  // Initialize UI & Load Data
  setupTheme();
  setupMenuNavigation();
  await loadUserData();
  setupEventHandlers();
  
  // Populate swaps initially
  renderSwaps('');
}

// Theme Management (Light / Dark Mode)
function setupTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  
  // Check default setting
  const savedTheme = localStorage.getItem('ht_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  toggleBtn.onclick = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('ht_theme', newTheme);
    updateThemeIcon(newTheme);
  };
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-toggle').querySelector('i');
  if (theme === 'light') {
    icon.className = 'fa-solid fa-sun';
  } else {
    icon.className = 'fa-solid fa-moon';
  }
}

// Sidebar Navigation Router
function setupMenuNavigation() {
  const menuItems = document.querySelectorAll('.menu-item');
  const panels = document.querySelectorAll('.tab-panel');
  const pageTitle = document.getElementById('page-title');
  const sidebar = document.getElementById('dashboard-sidebar');

  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const tab = item.getAttribute('data-tab');
      if (!tab) return; // ignore buttons like logout

      activeTab = tab;
      
      // Update active links
      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Update active Panels
      panels.forEach(p => p.classList.remove('active'));
      const activePanel = document.getElementById(`tab-${tab}`);
      if (activePanel) activePanel.classList.add('active');

      // Title & Mobile Auto-close
      pageTitle.innerText = item.querySelector('span').innerText;
      sidebar.classList.remove('active');
    });
  });

  // Mobile drawer controls
  document.getElementById('mobile-toggle').onclick = () => {
    sidebar.classList.toggle('active');
  };

  // Logout Button click
  document.getElementById('logout-btn').onclick = (e) => {
    e.preventDefault();
    localStorage.removeItem('ht_token');
    localStorage.removeItem('ht_offline_user');
    showAlert('Logging out, goodbye!', 'info');
    setTimeout(() => window.location.href = 'index.html', 1000);
  };
}

// -------------------------------------------------------------
// LOAD PROFILE & ASSESSMENTS DATA
// -------------------------------------------------------------
async function loadUserData() {
  // Check if admin tab is visible (if user contains admin name or mock is configured)
  const isAdmin = currentUser.email.toLowerCase().includes('admin');
  if (isAdmin) {
    document.getElementById('admin-sidebar-item').style.display = 'block';
    await loadAdminDashboardData();
  }

  // Load assessments
  if (isOffline) {
    // Read from LocalStorage fallback
    const allMockAssessments = JSON.parse(localStorage.getItem('ht_mock_assessments') || '[]');
    assessmentHistory = allMockAssessments.filter(a => a.userId === currentUser._id);
  } else {
    try {
      const res = await fetch(`${API_URL}/api/assessments`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      const data = await res.json();
      if (data.success) {
        assessmentHistory = data.history;
      }
    } catch (err) {
      showAlert('Failed to retrieve server assessment history.', 'error');
    }
  }

  // Update UI Elements with latest metrics
  updateOverviewDashboard();
}

// -------------------------------------------------------------
// DASHBOARD UPDATE ENGINE
// -------------------------------------------------------------
function updateOverviewDashboard() {
  const latest = assessmentHistory[0];

  // Set Forms values initially
  document.getElementById('assess-name').value = currentUser.name;
  document.getElementById('assess-age').value = currentUser.age;
  document.getElementById('assess-weight').value = currentUser.weight;
  document.getElementById('assess-height').value = currentUser.height;
  document.getElementById('assess-activity').value = currentUser.activityLevel;
  document.getElementById('assess-goal').value = currentUser.goal;

  // Set Profile form values
  document.getElementById('prof-name').value = currentUser.name;
  document.getElementById('prof-email').value = currentUser.email;
  document.getElementById('prof-age').value = currentUser.age;
  document.getElementById('prof-weight').value = currentUser.weight;
  document.getElementById('prof-height').value = currentUser.height;

  // Set Planners values
  document.getElementById('hostel-mode-toggle').checked = currentUser.hostelMode || false;
  document.getElementById('monthly-budget').value = currentUser.monthlyBudget || 200;
  calculateBudgetBreakdown();

  // Load Daily Challenges state
  loadChallengesState();

  if (!latest) {
    // No assessment history yet, display placeholder indicator
    showAlert('Please complete your first Biometric Assessment!', 'info');
    return;
  }

  // 1. KPI Cards
  animateCounter('kpi-bmi', latest.bmi, 1);
  document.getElementById('kpi-bmi-lbl').innerText = latest.bmiCategory;
  animateCounter('kpi-calories', latest.calories);
  animateCounter('kpi-health-score', latest.healthScore);
  animateCounter('kpi-bio-age', latest.biologicalAge, 1);
  document.getElementById('kpi-actual-age').innerText = `yrs (Actual: ${latest.age})`;

  // 2. Calculations panel outputs
  document.getElementById('calc-bmi').innerText = latest.bmi;
  document.getElementById('calc-bmi-cat').innerText = latest.bmiCategory;
  document.getElementById('calc-bmr').innerText = `${latest.bmr} kcal`;
  document.getElementById('calc-tdee').innerText = `${latest.tdee} kcal`;
  document.getElementById('calc-fat').innerText = `${latest.bodyFat} %`;
  document.getElementById('calc-lbm').innerText = `${latest.lbm} kg`;
  document.getElementById('calc-water').innerText = `${(latest.water / 1000).toFixed(2)} L`;
  
  const heightM = latest.height / 100;
  const idealWeight = Math.round(21.7 * heightM * heightM);
  document.getElementById('calc-ideal-wt').innerText = `${idealWeight} kg`;
  
  const wtDiff = latest.weight - idealWeight;
  document.getElementById('calc-wt-diff').innerText = wtDiff === 0 ? 'Ideal!' : `${wtDiff > 0 ? '+' : ''}${wtDiff.toFixed(1)} kg`;

  // 3. Update Digital Health Twin
  const twinBox = document.getElementById('twin-box');
  twinBox.className = `health-twin-box ${latest.bmiCategory.toLowerCase()}`;
  document.getElementById('twin-bmi-overlay').innerText = `BMI: ${latest.bmi}`;
  document.getElementById('twin-fat-overlay').innerText = `Fat: ${latest.bodyFat}%`;
  document.getElementById('twin-lbm-overlay').innerText = `LBM: ${latest.lbm}kg`;

  // 4. Update PHI circular gauge
  const circumference = 2 * Math.PI * 70; // 2 * pi * r = 439.8
  const offset = circumference - (latest.healthScore / 100) * circumference;
  const gaugeFill = document.getElementById('phi-gauge-circle');
  gaugeFill.style.strokeDasharray = circumference;
  gaugeFill.style.strokeDashoffset = offset;
  document.getElementById('phi-gauge-val').innerText = latest.healthScore;
  
  const lbl = document.querySelector('.gauge-lbl');
  if (latest.healthScore >= 85) lbl.innerText = 'EXCELLENT';
  else if (latest.healthScore >= 70) lbl.innerText = 'GOOD';
  else if (latest.healthScore >= 50) lbl.innerText = 'FAIR';
  else lbl.innerText = 'CRITICAL';

  // 5. Update Health Passport Widget
  document.getElementById('passport-name').innerText = latest.name;
  document.getElementById('passport-score').innerText = `${latest.healthScore} / 100`;
  document.getElementById('passport-bmi').innerText = `${latest.bmi} (${latest.bmiCategory})`;
  document.getElementById('passport-bio-age').innerText = `${latest.biologicalAge} yrs`;
  document.getElementById('passport-tdee').innerText = `${latest.bmr} / ${latest.tdee}`;
  document.getElementById('passport-goal').innerText = latest.goal;

  // 6. Update Virtual Nutritionist Report Text
  generateNutritionistReport(latest);

  // 7. Update Meal Plans based on goal & hostel toggle
  renderMealPlan(latest.goal);

  // 8. Update Health Risk Analyzer outputs
  renderRiskAnalyzer(latest);

  // 9. Update History table logs
  renderHistoryTable();

  // 10. Load charts
  renderBiometricCharts(latest);

  // 11. Synchronize daily challenge protein requirements label
  document.getElementById('challenge-protein-text').innerText = `Hit ${latest.protein}g protein requirements`;
  document.getElementById('challenge-water-text').innerText = `Drink ${(latest.water / 1000).toFixed(1)}L of water today`;

  // 12. Render achievements badges
  updateAchievementsBadgeGlows();
}

// -------------------------------------------------------------
// LOCAL CALCULATIONS ENGINE (DUPLICATES SERVER-SIDE METRICS FOR CLIENT-SIDE OFFLINE CAPABILITY)
// -------------------------------------------------------------
function calculateMetricsClient(data) {
  const { name, gender, age, weight, height, activityLevel, goal } = data;
  const w = parseFloat(weight);
  const h = parseFloat(height);
  const a = parseInt(age);

  const heightM = h / 100;
  const bmi = parseFloat((w / (heightM * heightM)).toFixed(2));

  let bmiCategory = 'Normal';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi >= 18.5 && bmi < 25) bmiCategory = 'Normal';
  else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';

  let bmr = (gender === 'Male') 
    ? (10 * w + 6.25 * h - 5 * a + 5)
    : (10 * w + 6.25 * h - 5 * a - 161);
  bmr = Math.round(bmr);

  let activityFactor = 1.2;
  switch (activityLevel) {
    case 'Sedentary': activityFactor = 1.2; break;
    case 'Lightly Active': activityFactor = 1.375; break;
    case 'Moderately Active': activityFactor = 1.55; break;
    case 'Very Active': activityFactor = 1.725; break;
    case 'Athlete': activityFactor = 1.9; break;
  }
  const tdee = Math.round(bmr * activityFactor);

  const genderMultiplier = gender === 'Male' ? 1 : 0;
  let bodyFat = (1.20 * bmi) + (0.23 * a) - (10.8 * genderMultiplier) - 5.4;
  bodyFat = parseFloat(Math.max(3, Math.min(60, bodyFat)).toFixed(1));

  const lbm = parseFloat((w * (1 - bodyFat / 100)).toFixed(1));

  let calories = (goal === 'Weight Loss') ? tdee - 500 : (goal === 'Weight Gain') ? tdee + 500 : tdee;
  calories = Math.max(1200, calories);

  let water = w * 35;
  if (activityLevel === 'Very Active' || activityLevel === 'Athlete') water += 1000;
  else if (activityLevel === 'Moderately Active') water += 500;
  water = Math.round(water);

  const protein = Math.round(w * 1.8);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round(Math.max(50, (calories - (protein * 4) - (fat * 9)) / 4));

  let bioAge = a;
  if (bmiCategory === 'Overweight') bioAge += 1.5;
  else if (bmiCategory === 'Obese') bioAge += 3.5;
  else if (bmiCategory === 'Underweight') bioAge += 1;

  if (gender === 'Male') {
    if (bodyFat > 25) bioAge += 2;
    else if (bodyFat >= 10 && bodyFat <= 17) bioAge -= 1.5;
  } else {
    if (bodyFat > 32) bioAge += 2;
    else if (bodyFat >= 18 && bodyFat <= 25) bioAge -= 1.5;
  }

  if (activityLevel === 'Sedentary') bioAge += 2;
  else if (activityLevel === 'Very Active' || activityLevel === 'Athlete') bioAge -= 2;
  bioAge = parseFloat(Math.max(18, Math.min(a + 10, bioAge)).toFixed(1));

  let phiScore = 0;
  if (bmiCategory === 'Normal') phiScore += 30;
  else if (bmiCategory === 'Overweight' || bmiCategory === 'Underweight') phiScore += 20;
  else phiScore += 10;

  if (activityLevel === 'Athlete') phiScore += 20;
  else if (activityLevel === 'Very Active') phiScore += 18;
  else if (activityLevel === 'Moderately Active') phiScore += 15;
  else if (activityLevel === 'Lightly Active') phiScore += 10;
  else phiScore += 5;

  phiScore += 20; // Nutrition
  phiScore += 15; // Water
  
  if (gender === 'Male' && bodyFat >= 8 && bodyFat <= 20) phiScore += 15;
  else if (gender === 'Female' && bodyFat >= 15 && bodyFat <= 28) phiScore += 15;
  else phiScore += 8;

  // Add streak bonus up to 10 points
  const currentStreak = currentUser.challenges?.streak || 0;
  phiScore += Math.min(10, currentStreak * 2);

  phiScore = Math.min(100, Math.max(10, phiScore));

  return {
    bmi,
    bmiCategory,
    bmr,
    tdee,
    bodyFat,
    lbm,
    calories,
    water,
    protein,
    carbs,
    fat,
    healthScore: phiScore,
    biologicalAge: bioAge
  };
}

// -------------------------------------------------------------
// EVENT HANDLERS & API SUBMISSIONS
// -------------------------------------------------------------
function setupEventHandlers() {
  // 1. Assessment Form Submit
  const assessForm = document.getElementById('assessment-form');
  assessForm.onsubmit = async (e) => {
    e.preventDefault();

    const name = document.getElementById('assess-name').value;
    const gender = document.getElementById('assess-gender').value;
    const age = parseInt(document.getElementById('assess-age').value);
    const weight = parseFloat(document.getElementById('assess-weight').value);
    const height = parseFloat(document.getElementById('assess-height').value);
    const activityLevel = document.getElementById('assess-activity').value;
    const goal = document.getElementById('assess-goal').value;

    const payload = { name, gender, age, weight, height, activityLevel, goal };

    if (isOffline) {
      // Client LocalStorage Fallback Saving
      const calculated = calculateMetricsClient(payload);
      const newAssessment = {
        _id: 'mock_assess_' + Math.random().toString(36).substr(2, 9),
        userId: currentUser._id,
        ...payload,
        ...calculated,
        createdAt: new Date().toISOString()
      };

      // Push to local storage assessment list
      const assessmentsList = JSON.parse(localStorage.getItem('ht_mock_assessments') || '[]');
      assessmentsList.push(newAssessment);
      localStorage.setItem('ht_mock_assessments', JSON.stringify(assessmentsList));

      // Award mock achievements
      const updatedAchievements = [...(currentUser.achievements || [])];
      if (!updatedAchievements.includes('first_assessment')) updatedAchievements.push('first_assessment');
      if (calculated.protein >= 120 && !updatedAchievements.includes('protein_master')) updatedAchievements.push('protein_master');
      if (calculated.healthScore >= 85 && !updatedAchievements.includes('health_champion')) updatedAchievements.push('health_champion');

      // Update mock user profile
      const usersList = JSON.parse(localStorage.getItem('ht_mock_users') || '[]');
      const userIdx = usersList.findIndex(u => u._id === currentUser._id);
      if (userIdx !== -1) {
        usersList[userIdx] = { ...usersList[userIdx], name, gender, age, weight, height, activityLevel, goal, achievements: updatedAchievements };
        localStorage.setItem('ht_mock_users', JSON.stringify(usersList));
        currentUser = usersList[userIdx];
        localStorage.setItem('ht_offline_user', JSON.stringify(currentUser));
      }

      showAlert('Assessment saved locally!', 'success');
      await loadUserData();
    } else {
      // Backend Request
      try {
        const res = await fetch(`${API_URL}/api/assessments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showAlert('Assessment created successfully on server!', 'success');
          if (data.unlockedAchievements.length > 0) {
            showAlert(`Achievement Unlocked: ${data.unlockedAchievements.join(', ')}!`, 'info');
          }
          await loadUserData();
        } else {
          showAlert(data.message || 'Error processing assessment.', 'error');
        }
      } catch (err) {
        showAlert('Connection error, assessment could not be saved.', 'error');
      }
    }
  };

  // 2. Profile Update Form
  const profileForm = document.getElementById('profile-form');
  profileForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('prof-name').value;
    const age = parseInt(document.getElementById('prof-age').value);
    const weight = parseFloat(document.getElementById('prof-weight').value);
    const height = parseFloat(document.getElementById('prof-height').value);

    const payload = { name, age, weight, height };

    if (isOffline) {
      const usersList = JSON.parse(localStorage.getItem('ht_mock_users') || '[]');
      const idx = usersList.findIndex(u => u._id === currentUser._id);
      if (idx !== -1) {
        usersList[idx] = { ...usersList[idx], ...payload };
        localStorage.setItem('ht_mock_users', JSON.stringify(usersList));
        currentUser = usersList[idx];
        localStorage.setItem('ht_offline_user', JSON.stringify(currentUser));
      }
      showAlert('Offline Profile Updated!', 'success');
      await loadUserData();
    } else {
      try {
        const res = await fetch(`${API_URL}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showAlert('Profile Updated successfully!', 'success');
          currentUser = data.user;
          await loadUserData();
        }
      } catch (err) {
        showAlert('Error updating profile.', 'error');
      }
    }
  };

  // 3. Contact Form Submit
  const contactForm = document.getElementById('contact-form');
  contactForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    const payload = { name, email, message };

    if (isOffline) {
      const contacts = JSON.parse(localStorage.getItem('ht_mock_contacts') || '[]');
      contacts.push({ _id: Math.random().toString(36).substr(2,9), ...payload, createdAt: new Date().toISOString() });
      localStorage.setItem('ht_mock_contacts', JSON.stringify(contacts));
      showAlert('Feedback saved locally in mock inbox!', 'success');
      contactForm.reset();
      await loadUserData();
    } else {
      try {
        const res = await fetch(`${API_URL}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showAlert(data.message, 'success');
          contactForm.reset();
          await loadUserData();
        }
      } catch (err) {
        showAlert('Could not deliver feedback.', 'error');
      }
    }
  };

  // 4. Hostel Student Mode Toggle
  document.getElementById('hostel-mode-toggle').onchange = async (e) => {
    const isChecked = e.target.checked;
    currentUser.hostelMode = isChecked;
    await syncSettings({ hostelMode: isChecked });
    showAlert(isChecked ? 'Hostel Mode Active!' : 'Hostel Mode Disabled', 'info');
    updateOverviewDashboard();
  };

  // 5. Budget Input Update
  document.getElementById('monthly-budget').oninput = async (e) => {
    const budgetVal = parseFloat(e.target.value) || 0;
    calculateBudgetBreakdown();
    // Throttle profile saving
    clearTimeout(window.budgetSaveTimer);
    window.budgetSaveTimer = setTimeout(async () => {
      currentUser.monthlyBudget = budgetVal;
      await syncSettings({ monthlyBudget: budgetVal });
    }, 1000);
  };

  // 6. Healthy Food Swap Search Keyup
  document.getElementById('swap-search').onkeyup = (e) => {
    renderSwaps(e.target.value);
  };

  // 7. Daily Challenges Checkbox Actions
  const challengeCheckboxes = document.querySelectorAll('.daily-check');
  challengeCheckboxes.forEach(cb => {
    cb.onchange = async () => {
      // Compute score increment, streak etc
      const challengesState = {
        water: document.getElementById('challenge-water').checked,
        steps: document.getElementById('challenge-steps').checked,
        noSugar: document.getElementById('challenge-sugar').checked,
        protein: document.getElementById('challenge-protein').checked
      };

      // Check if all completed today
      const allDone = Object.values(challengesState).every(v => v === true);
      let streak = currentUser.challenges?.streak || 0;
      const todayStr = new Date().toDateString();
      const lastUpdated = currentUser.challenges?.lastUpdated || '';

      if (allDone && lastUpdated !== todayStr) {
        streak += 1;
        showAlert(`Great job! Completed all challenges. Streak: ${streak} days!`, 'success');
        
        // Unlock 30-day badge simulation
        if (streak >= 30 && !currentUser.achievements.includes('streak_30')) {
          currentUser.achievements.push('streak_30');
          showAlert('Achievement Unlocked: 30 Day Streak!', 'info');
        }
      }

      // Check for Hydration badge
      if (challengesState.water && !currentUser.achievements.includes('hydration_hero')) {
        currentUser.achievements.push('hydration_hero');
        showAlert('Achievement Unlocked: Hydration Hero!', 'info');
      }

      const updatedChallenges = {
        ...challengesState,
        streak,
        lastUpdated: allDone ? todayStr : lastUpdated
      };

      currentUser.challenges = updatedChallenges;
      await syncSettings({ challenges: updatedChallenges, achievements: currentUser.achievements });
      updateOverviewDashboard();
    };
  });

  // 8. Deficiency Detector Checker Trigger
  document.getElementById('btn-detect-deficiencies').onclick = () => {
    const checkedSyms = Array.from(document.querySelectorAll('.symptom-check:checked')).map(cb => cb.value);
    const resultBox = document.getElementById('deficiency-detector-result');

    if (checkedSyms.length === 0) {
      resultBox.innerHTML = 'Select checkboxes to evaluate your body symptoms.';
      return;
    }

    let reportHtml = '<ul style="padding-left: 20px; line-height:1.6;">';
    checkedSyms.forEach(sym => {
      const match = deficienciesDb[sym];
      if (match) {
        reportHtml += `<li style="margin-bottom: 8px;"><strong>${match.name}:</strong> ${match.suggestions}</li>`;
      }
    });
    reportHtml += '</ul>';
    resultBox.innerHTML = reportHtml;
    showAlert('Deficiency analysis completed!', 'success');
  };

  // 9. Grocery List Generator Trigger
  document.getElementById('btn-generate-grocery').onclick = () => {
    const latest = assessmentHistory[0];
    const container = document.getElementById('grocery-list-container');
    if (!latest) {
      container.innerHTML = '<p class="text-muted">Perform an assessment to generate custom grocery lists.</p>';
      return;
    }

    const mode = currentUser.hostelMode ? 'hostel' : 'standard';
    const activePlan = mealPlans[latest.goal][mode];

    // Simple ingredient parser/aggregator
    let rawItems = [];
    if (mode === 'standard') {
      rawItems = ['Oats (50g)', 'Skimmed Milk (200ml)', 'Almonds (10)', 'Blueberries', 'Eggs (2 wholes)', 'Chicken breast (150g)', 'Salad greens', 'Avocado (0.5)', 'Whole grain bread', 'Salmon (120g)', 'Broccoli', 'Sweet potato', 'Apple / Pear', 'Green tea bags'];
    } else {
      rawItems = ['Oats (50g)', 'Bananas (2)', 'Peanut butter (1 jar)', 'Lentils / Dal (500g)', 'Cucumbers', 'Low-fat paneer (200g)', 'Whole wheat bread', 'Whole eggs (1 dozen)', 'Rice / Flour (wheat)', 'Soya chunks (1 pack)', 'Ghee (small pack)', 'Roasted Chana (1 pack)'];
    }

    let checklistHtml = '<div style="display:flex; flex-direction:column; gap:8px;">';
    rawItems.forEach((item, idx) => {
      checklistHtml += `
        <label style="display:flex; align-items:center; gap:10px;">
          <input type="checkbox" id="grocery-item-${idx}">
          <span>${item}</span>
        </label>
      `;
    });
    checklistHtml += '</div>';
    container.innerHTML = checklistHtml;
    showAlert('Grocery list aggregated from daily meal plans!', 'success');
  };

  // 10. Printable triggers
  document.getElementById('btn-print-passport').onclick = () => {
    window.print();
  };

  document.getElementById('btn-print-report').onclick = () => {
    window.print();
  };
}

// Helper to push settings updates to backend / fallback storage
async function syncSettings(updateFields) {
  if (isOffline) {
    const users = JSON.parse(localStorage.getItem('ht_mock_users') || '[]');
    const idx = users.findIndex(u => u._id === currentUser._id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updateFields };
      localStorage.setItem('ht_mock_users', JSON.stringify(users));
      currentUser = users[idx];
      localStorage.setItem('ht_offline_user', JSON.stringify(currentUser));
    }
  } else {
    try {
      await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify(updateFields)
      });
    } catch (err) {
      console.warn('API sync failed.');
    }
  }
}

// -------------------------------------------------------------
// TEXT CONTENT & UI RENDERERS
// -------------------------------------------------------------
function calculateBudgetBreakdown() {
  const budget = parseFloat(document.getElementById('monthly-budget').value) || 0;
  document.getElementById('budget-daily').innerText = `$${(budget / 30).toFixed(2)}`;
  document.getElementById('budget-weekly').innerText = `$${(budget / 4).toFixed(2)}`;
}

function loadChallengesState() {
  const challenges = currentUser.challenges || { water: false, steps: false, noSugar: false, protein: false, streak: 0 };
  document.getElementById('streak-counter').innerText = challenges.streak;
  document.getElementById('challenge-water').checked = challenges.water;
  document.getElementById('challenge-steps').checked = challenges.steps;
  document.getElementById('challenge-sugar').checked = challenges.noSugar;
  document.getElementById('challenge-protein').checked = challenges.protein;

  // Toggle card glows
  document.getElementById('challenge-water-card').className = `challenge-item ${challenges.water ? 'completed' : ''}`;
  document.getElementById('challenge-steps-card').className = `challenge-item ${challenges.steps ? 'completed' : ''}`;
  document.getElementById('challenge-sugar-card').className = `challenge-item ${challenges.noSugar ? 'completed' : ''}`;
  document.getElementById('challenge-protein-card').className = `challenge-item ${challenges.protein ? 'completed' : ''}`;
}

function updateAchievementsBadgeGlows() {
  const achievements = currentUser.achievements || [];
  achievements.forEach(achId => {
    const item = document.getElementById(`badge-${achId}`);
    if (item) {
      item.classList.add('unlocked');
    }
  });
}

function generateNutritionistReport(latest) {
  let text = '';
  if (latest.bmiCategory === 'Normal') {
    text = `Hey ${latest.name}, your metrics represent excellent physical state. Ideal BMI of ${latest.bmi} shows stable body mass. At ${latest.tdee} kcal TDEE, maintain this metabolic rate by consuming healthy complex carbohydrates (brown rice, oats) and clean proteins. Stick to drinking ${((latest.water)/1000).toFixed(1)}L water daily.`;
  } else if (latest.bmiCategory === 'Overweight' || latest.bmiCategory === 'Obese') {
    text = `Hey ${latest.name}, clinical calculations indicate a elevated BMI index of ${latest.bmi}. To achieve a normal category range, target a calorie deficit limit near ${latest.calories} kcal daily. Cut saturated fats and add lean protein to preserve lean tissue (${latest.lbm}kg). Focus on drinking ${((latest.water)/1000).toFixed(1)}L water to assist metabolism.`;
  } else {
    text = `Hey ${latest.name}, you are currently under healthy weight proportions (BMI ${latest.bmi}). Your calorie intake threshold has been bumped to ${latest.calories} kcal to support clean cellular mass development. Focus on liquid meals, peanut butter, clean complex carbs, and regular strength training.`;
  }
  document.getElementById('nutritionist-report-text').innerText = text;
}

function renderMealPlan(goal) {
  const isHostel = currentUser.hostelMode;
  const modeKey = isHostel ? 'hostel' : 'standard';
  const plan = mealPlans[goal][modeKey];

  document.getElementById('meal-plan-title').innerText = `Daily Plan: ${goal} (${isHostel ? 'Hostel Budget Mode' : 'Standard SaaS Mode'})`;
  document.getElementById('meal-breakfast-items').innerText = plan.breakfast;
  document.getElementById('meal-lunch-items').innerText = plan.lunch;
  document.getElementById('meal-dinner-items').innerText = plan.dinner;
  document.getElementById('meal-snack-items').innerText = plan.snacks;
}

function renderRiskAnalyzer(latest) {
  const riskBox = document.getElementById('risk-analyzer-result');
  let diabetesRisk = 'Low Risk';
  let cardiovascularRisk = 'Low Risk';
  let jointRisk = 'Low Risk';

  // Diabetes risk calculation
  if (latest.bmi >= 30) diabetesRisk = 'High Risk';
  else if (latest.bmi >= 25) diabetesRisk = 'Moderate Risk';

  // Cardiovascular risk calculation
  if (latest.bodyFat > 25 && latest.gender === 'Male') cardiovascularRisk = 'High Risk';
  else if (latest.bodyFat > 32 && latest.gender === 'Female') cardiovascularRisk = 'High Risk';
  else if (latest.bmi >= 25) cardiovascularRisk = 'Moderate Risk';

  // Joint Strain Risk
  if (latest.bmi >= 30) jointRisk = 'High Risk';
  else if (latest.bmi >= 27) jointRisk = 'Moderate Risk';

  riskBox.innerHTML = `
    <ul style="list-style:none; display:flex; flex-direction:column; gap:10px;">
      <li><strong>Type II Diabetes Risk:</strong> <span style="color: ${diabetesRisk === 'High Risk' ? 'var(--danger)' : diabetesRisk === 'Moderate Risk' ? 'var(--warning)' : 'var(--accent)'}">${diabetesRisk}</span></li>
      <li><strong>Cardiovascular Strain:</strong> <span style="color: ${cardiovascularRisk === 'High Risk' ? 'var(--danger)' : cardiovascularRisk === 'Moderate Risk' ? 'var(--warning)' : 'var(--accent)'}">${cardiovascularRisk}</span></li>
      <li><strong>Weight Joint Loading Risk:</strong> <span style="color: ${jointRisk === 'High Risk' ? 'var(--danger)' : jointRisk === 'Moderate Risk' ? 'var(--warning)' : 'var(--accent)'}">${jointRisk}</span></li>
    </ul>
  `;
}

function renderSwaps(searchQuery) {
  const container = document.getElementById('swaps-results-list');
  const query = searchQuery.toLowerCase().trim();

  const filtered = foodSwaps.filter(s => s.original.toLowerCase().includes(query) || s.replacement.toLowerCase().includes(query));

  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;">No direct matching food craving found. Try search strings like: pizza, burger, soda.</p>';
    return;
  }

  let html = '';
  filtered.forEach(item => {
    html += `
      <div class="swap-card">
        <div class="swap-item original">
          <h5>${item.original}</h5>
        </div>
        <div class="swap-icon-arrow"><i class="fa-solid fa-right-long"></i></div>
        <div class="swap-item alternative">
          <h5>${item.replacement}</h5>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-top:2px;">Calories: ${item.calories} | Carbs: ${item.carbs}</p>
        </div>
      </div>
      <p style="font-size: 0.75rem; color: var(--text-muted); padding: 0 10px 10px; border-bottom: 1px solid var(--glass-border); margin-bottom:12px;">
        <i class="fa-solid fa-circle-check" style="color:var(--accent); margin-right:4px;"></i>${item.details}
      </p>
    `;
  });
  container.innerHTML = html;
}

function renderHistoryTable() {
  const tbody = document.getElementById('assessment-history-body');
  if (assessmentHistory.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-muted" style="text-align:center;">No history records found.</td></tr>';
    return;
  }

  let html = '';
  assessmentHistory.forEach(a => {
    const date = new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    html += `
      <tr>
        <td>${date}</td>
        <td>${a.weight} kg</td>
        <td>${a.height} cm</td>
        <td>${a.bmi}</td>
        <td>${a.bodyFat}%</td>
        <td>${a.healthScore}/100</td>
        <td>${a.goal}</td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// -------------------------------------------------------------
// CHART RENDERING ENGINES
// -------------------------------------------------------------
function renderBiometricCharts(latest) {
  // Destructure variables
  const { healthScore, bmi, bodyFat, lbm, water, protein, carbs, fat, goal, weight } = latest;

  // 1. RADAR CHART
  const radarCtx = document.getElementById('radarChart').getContext('2d');
  if (radarChartInstance) {
    radarChartInstance.destroy();
  }

  // Compute metric values based on body properties
  const hydrationStrength = Math.min(100, Math.round((water / 3000) * 100));
  const proteinStrength = Math.min(100, Math.round((protein / 150) * 100));
  const weightScore = bmi >= 18.5 && bmi <= 24.9 ? 95 : bmi < 25 ? 75 : 55;
  const consistencyScore = Math.min(100, 40 + (currentUser.challenges?.streak || 0) * 15);

  radarChartInstance = new Chart(radarCtx, {
    type: 'radar',
    data: {
      labels: ['Nutrition', 'Fitness', 'Hydration', 'Consistency', 'Weight Goal', 'Lean Ratio'],
      datasets: [{
        label: 'My Metrics Strengths',
        data: [proteinStrength, 75, hydrationStrength, consistencyScore, weightScore, Math.round(100 - bodyFat)],
        backgroundColor: 'rgba(0, 212, 255, 0.2)',
        borderColor: 'var(--primary)',
        pointBackgroundColor: 'var(--accent)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          pointLabels: { color: 'var(--text-muted)', font: { size: 10 } },
          ticks: { display: false },
          suggestedMin: 30,
          suggestedMax: 100
        }
      },
      plugins: { legend: { display: false } }
    }
  });

  // 2. FUTURE SIMULATOR LINE CHART
  const simCtx = document.getElementById('simulatorChart').getContext('2d');
  if (simulatorChartInstance) {
    simulatorChartInstance.destroy();
  }

  // Weight predictions
  // Loss: -0.5kg per week (-2kg per month). Gain: +0.5kg per week (+2kg per month)
  const rate = goal === 'Weight Loss' ? -2.0 : goal === 'Weight Gain' ? 2.0 : 0.0;
  const wtCurrent = parseFloat(weight);

  const months = ['Current', '1 Month', '3 Months', '6 Months', '12 Months'];
  const dataPoints = [
    wtCurrent,
    parseFloat((wtCurrent + rate).toFixed(1)),
    parseFloat((wtCurrent + rate * 3).toFixed(1)),
    parseFloat((wtCurrent + rate * 6).toFixed(1)),
    parseFloat((wtCurrent + rate * 12).toFixed(1))
  ];

  simulatorChartInstance = new Chart(simCtx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Simulated Weight (kg)',
        data: dataPoints,
        borderColor: 'var(--accent)',
        backgroundColor: 'rgba(0, 255, 163, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: 'var(--text-muted)' } },
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: 'var(--text-muted)' } }
      },
      plugins: { legend: { display: false } }
    }
  });

  // 3. MACRONUTRIENT RING CHART
  const macroCtx = document.getElementById('macroChart').getContext('2d');
  if (macroChartInstance) {
    macroChartInstance.destroy();
  }

  document.getElementById('macro-p-val').innerText = `${protein}g`;
  document.getElementById('macro-c-val').innerText = `${carbs}g`;
  document.getElementById('macro-f-val').innerText = `${fat}g`;

  macroChartInstance = new Chart(macroCtx, {
    type: 'doughnut',
    data: {
      labels: ['Protein', 'Carbs', 'Fats'],
      datasets: [{
        data: [protein, carbs, fat],
        backgroundColor: ['#00D4FF', '#6A5CFF', '#00FFA3'],
        borderColor: 'transparent',
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: { legend: { display: false } }
    }
  });
}

// -------------------------------------------------------------
// ADMIN METRICS SYSTEM
// -------------------------------------------------------------
async function loadAdminDashboardData() {
  if (isOffline) {
    // LocalStorage Mock lists
    const users = JSON.parse(localStorage.getItem('ht_mock_users') || '[]');
    const assessments = JSON.parse(localStorage.getItem('ht_mock_assessments') || '[]');
    const contacts = JSON.parse(localStorage.getItem('ht_mock_contacts') || '[]');

    renderAdminUI({
      stats: {
        totalUsers: users.length,
        totalAssessments: assessments.length,
        totalContacts: contacts.length
      },
      users,
      contacts
    });
  } else {
    // Backend API fetch
    try {
      const res = await fetch(`${API_URL}/api/admin`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      const data = await res.json();
      if (data.success) {
        renderAdminUI(data);
      }
    } catch (err) {
      console.warn('Could not retrieve admin panel statistics.');
    }
  }
}

function renderAdminUI(data) {
  document.getElementById('admin-kpi-users').innerText = data.stats.totalUsers;
  document.getElementById('admin-kpi-assess').innerText = data.stats.totalAssessments;
  document.getElementById('admin-kpi-contacts').innerText = data.stats.totalContacts;

  // Render User list
  const usersTbody = document.getElementById('admin-users-list');
  let usersHtml = '';
  data.users.forEach(u => {
    const date = new Date(u.createdAt).toLocaleDateString();
    usersHtml += `
      <tr>
        <td style="font-family:monospace; font-size:0.75rem;">${u._id}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${date}</td>
      </tr>
    `;
  });
  usersTbody.innerHTML = usersHtml || '<tr><td colspan="4" class="text-muted" style="text-align:center;">No users registered.</td></tr>';

  // Render Feedback forms
  const feedbackTbody = document.getElementById('admin-feedback-list');
  let fbHtml = '';
  data.contacts.forEach(c => {
    const date = new Date(c.createdAt).toLocaleDateString();
    fbHtml += `
      <tr>
        <td>${c.name}</td>
        <td>${c.email}</td>
        <td>${c.message}</td>
        <td>${date}</td>
      </tr>
    `;
  });
  feedbackTbody.innerHTML = fbHtml || '<tr><td colspan="4" class="text-muted" style="text-align:center;">No customer contact messages.</td></tr>';
}

// -------------------------------------------------------------
// UTILITIES
// -------------------------------------------------------------
function animateCounter(elementId, targetVal, decimals = 0) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const target = parseFloat(targetVal);
  if (isNaN(target)) {
    el.innerText = '--';
    return;
  }

  let count = 0;
  const speed = 30; // ms per update
  const increment = target / 15; // 15 steps

  const timer = setInterval(() => {
    count += increment;
    if (count >= target) {
      clearInterval(timer);
      el.innerText = target.toFixed(decimals);
    } else {
      el.innerText = count.toFixed(decimals);
    }
  }, speed);
}

// Trigger initial loader
window.onload = initApp;
