// Load required modules
const express = require('express');
const mongoose = require('mongoose');

// Create express app
const app = express();
app.use(express.json());
const routes = require('./routes');
app.use('/', routes);


// ✅ MongoDB connection string (with your credentials & database name)
const mongoURI = 'mongodb+srv://Utkarsh77:Majesty7779@symptomcluster.bribglg.mongodb.net/symptomDB?retryWrites=true&w=majority&appName=SymptomCluster';

// Connect to MongoDB using mongoose
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Set up basic server route
app.get('/', (req, res) => {
    res.send('Hello! Symptom Chain Finder backend is running.');
});
app.use(express.static('public'));

// Start the Express server
app.listen(3000, () => {
    console.log('🚀 Server is running on http://localhost:3000');
});
