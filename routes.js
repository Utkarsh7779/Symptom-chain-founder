const express = require('express');
const router = express.Router();
const Patient = require('./models/Patient');

// POST /patients - Add a patient with symptoms and diagnosis
router.post('/patients', async (req, res) => {
    try {
        const { name, symptoms, diagnosis } = req.body;

        const newPatient = new Patient({
            name,
            symptoms, 
            diagnosis
        });

        await newPatient.save();

        res.status(201).json({ message: '✅ Patient added successfully', data: newPatient });
    } catch (error) {
        console.error("❌ Error saving patient:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
// GET /patients - Retrieve all patients and their symptom chains
router.get('/patients', async (req, res) => {
    try {
        const patients = await Patient.find().sort({ _id: -1 }); // latest first
        res.status(200).json(patients);
    } catch (error) {
        console.error("❌ Error fetching patients:", error);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /patterns - Find common symptom chains by diagnosis
router.get('/patterns', async (req, res) => {
    try {
        const patterns = await Patient.aggregate([
            {
                $project: {
                    symptomChain: "$symptoms.name",
                    diagnosis: 1
                }
            },
            {
                $group: {
                    _id: { symptomChain: "$symptomChain", diagnosis: "$diagnosis" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    symptomChain: "$_id.symptomChain",
                    diagnosis: "$_id.diagnosis",
                    count: 1
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.status(200).json(patterns);
    } catch (error) {
        console.error("❌ Error aggregating patterns:", error);
        res.status(500).json({ message: 'Server error' });
    }
});
// POST /predict - Predict diagnosis based on given symptom chain
router.post('/predict', async (req, res) => {
    try {
        const { symptoms } = req.body;

        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({ message: "❌ Please provide an array of symptoms" });
        }

        // Aggregate matching symptom chains
        const predictions = await Patient.aggregate([
            {
                $project: {
                    diagnosis: 1,
                    symptomChain: "$symptoms.name"
                }
            },
            {
                $match: {
                    symptomChain: { $all: symptoms }
                }
            },
            {
                $group: {
                    _id: "$diagnosis",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 1
            }
        ]);

        if (predictions.length === 0) {
            return res.status(404).json({ message: "No matching diagnosis found for given symptoms" });
        }

        res.status(200).json({
            predictedDiagnosis: predictions[0]._id,
            matches: predictions[0].count
        });

    } catch (error) {
        console.error("❌ Prediction error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});


