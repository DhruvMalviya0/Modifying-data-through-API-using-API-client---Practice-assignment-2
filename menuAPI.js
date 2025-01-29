const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define the MenuItem Schema
const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true }
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

// POST /menu - Create a new menu item
app.post('/menu', async (req, res) => {
    try {
        const { name, description, price } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ error: 'Name and price are required' });
        }
        const newItem = new MenuItem({ name, description, price });
        await newItem.save();
        res.status(201).json({ message: 'Menu item created successfully', data: newItem });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// GET /menu - Fetch all menu items
app.get('/menu', async (req, res) => {
    try {
        const items = await MenuItem.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// PUT /menu/:id - Update an existing menu item
app.put('/menu/:id', async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, { name, description, price }, { new: true, runValidators: true });
        if (!updatedItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.status(200).json({ message: 'Menu item updated successfully', data: updatedItem });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// DELETE /menu/:id - Delete a menu item
app.delete('/menu/:id', async (req, res) => {
    try {
        const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.status(200).json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
