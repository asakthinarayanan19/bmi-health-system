const { Assessments, Users } = require('../db');

// Health Calculations Helper
function calculateMetrics(data) {
  const { name, gender, age, weight, height, activityLevel, goal } = data;

  const w = parseFloat(weight);
  const h = parseFloat(height);
  const a = parseInt(age);

  // 1. BMI
  const heightM = h / 100;
  const bmi = parseFloat((w / (heightM * heightM)).toFixed(2));

  // 2. BMI Category
  let bmiCategory = 'Normal';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi >= 18.5 && bmi < 25) bmiCategory = 'Normal';
  else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';

  // 3. BMR (Mifflin-St Jeor)
  let bmr = 0;
  if (gender === 'Male') {
    bmr = 10 * w + 6.25 * h - 5 * a + 5;
  } else {
    bmr = 10 * w + 6.25 * h - 5 * a - 161;
  }
  bmr = Math.round(bmr);

  // 4. TDEE
  let activityFactor = 1.2;
  switch (activityLevel) {
    case 'Sedentary': activityFactor = 1.2; break;
    case 'Lightly Active': activityFactor = 1.375; break;
    case 'Moderately Active': activityFactor = 1.55; break;
    case 'Very Active': activityFactor = 1.725; break;
    case 'Athlete': activityFactor = 1.9; break;
  }
  const tdee = Math.round(bmr * activityFactor);

  // 5. Body Fat % (BMI-based adult formula)
  const genderMultiplier = gender === 'Male' ? 1 : 0;
  let bodyFat = (1.20 * bmi) + (0.23 * a) - (10.8 * genderMultiplier) - 5.4;
  bodyFat = parseFloat(Math.max(3, Math.min(60, bodyFat)).toFixed(1));

  // 6. Lean Body Mass
  const lbm = parseFloat((w * (1 - bodyFat / 100)).toFixed(1));

  // 7. Daily Calories based on Goal
  let calories = tdee;
  if (goal === 'Weight Loss') calories = tdee - 500;
  else if (goal === 'Weight Gain') calories = tdee + 500;
  calories = Math.max(1200, calories); // Safe minimum calorie limit

  // 8. Daily Water Intake (ml)
  let water = w * 35; // base 35ml per kg
  if (activityLevel === 'Very Active' || activityLevel === 'Athlete') water += 1000;
  else if (activityLevel === 'Moderately Active') water += 500;
  water = Math.round(water);

  // 9. Macronutrients
  // Protein: 1.8g per kg body weight
  const protein = Math.round(w * 1.8);
  // Fat: 25% of calories
  const fat = Math.round((calories * 0.25) / 9);
  // Carbs: Remainder of calories
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const carbs = Math.round(Math.max(50, (calories - proteinCalories - fatCalories) / 4));

  // 10. Biological Age
  let bioAge = a;
  // BMI offsets
  if (bmiCategory === 'Overweight') bioAge += 1.5;
  else if (bmiCategory === 'Obese') bioAge += 3.5;
  else if (bmiCategory === 'Underweight') bioAge += 1;
  // Body fat offsets
  if (gender === 'Male') {
    if (bodyFat > 25) bioAge += 2;
    else if (bodyFat >= 10 && bodyFat <= 17) bioAge -= 1.5; // optimal
  } else {
    if (bodyFat > 32) bioAge += 2;
    else if (bodyFat >= 18 && bodyFat <= 25) bioAge -= 1.5; // optimal
  }
  // Activity offsets
  if (activityLevel === 'Sedentary') bioAge += 2;
  else if (activityLevel === 'Very Active' || activityLevel === 'Athlete') bioAge -= 2;
  // Cap Biological Age logically
  bioAge = parseFloat(Math.max(18, Math.min(a + 10, bioAge)).toFixed(1));

  // 11. Personal Health Index (PHI)
  let phiScore = 0;
  // BMI Category contribution (Max 30)
  if (bmiCategory === 'Normal') phiScore += 30;
  else if (bmiCategory === 'Overweight' || bmiCategory === 'Underweight') phiScore += 20;
  else phiScore += 10;
  // Activity level (Max 20)
  if (activityLevel === 'Athlete') phiScore += 20;
  else if (activityLevel === 'Very Active') phiScore += 18;
  else if (activityLevel === 'Moderately Active') phiScore += 15;
  else if (activityLevel === 'Lightly Active') phiScore += 10;
  else phiScore += 5;
  // Base Nutrition Goal compliance (Max 20)
  phiScore += 20;
  // Base Water compliance (Max 15)
  phiScore += 15;
  // Extra bonus for healthy body fat range (Max 15)
  if (gender === 'Male' && bodyFat >= 8 && bodyFat <= 20) phiScore += 15;
  else if (gender === 'Female' && bodyFat >= 15 && bodyFat <= 28) phiScore += 15;
  else phiScore += 8;

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

exports.createAssessment = async (req, res) => {
  try {
    const { name, gender, age, weight, height, activityLevel, goal } = req.body;

    if (!name || !gender || !age || !weight || !height || !activityLevel || !goal) {
      return res.status(400).json({ success: false, message: 'Please provide all required parameters.' });
    }

    // Run calculation engine
    const calculated = calculateMetrics(req.body);

    const newAssessment = await Assessments.create({
      userId: req.user.id,
      name,
      gender,
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
      activityLevel,
      goal,
      ...calculated
    });

    // Award achievements & update user profile with latest stats
    const user = await Users.findById(req.user.id);
    const updatedAchievements = [...(user.achievements || [])];

    if (updatedAchievements.length === 0) {
      updatedAchievements.push('first_assessment');
    }

    if (calculated.protein >= 120 && !updatedAchievements.includes('protein_master')) {
      updatedAchievements.push('protein_master');
    }

    if (calculated.healthScore >= 85 && !updatedAchievements.includes('health_champion')) {
      updatedAchievements.push('health_champion');
    }

    // Update user profile fields with latest assessment
    await Users.updateById(req.user.id, {
      name,
      gender,
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
      activityLevel,
      goal,
      achievements: updatedAchievements
    });

    res.status(201).json({
      success: true,
      assessment: newAssessment,
      unlockedAchievements: updatedAchievements.filter(x => !user.achievements.includes(x))
    });
  } catch (err) {
    console.error('Create assessment error:', err);
    res.status(500).json({ success: false, message: 'Server error saving assessment.' });
  }
};

exports.getAssessments = async (req, res) => {
  try {
    const history = await Assessments.findByUserId(req.user.id);
    res.status(200).json({
      success: true,
      history
    });
  } catch (err) {
    console.error('Get assessments error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving assessments.' });
  }
};
