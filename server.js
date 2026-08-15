// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json({ limit: '5mb' }));

// ----- MongoDB Schemas -----
const siteDataSchema = new mongoose.Schema({
  settings: Object,
  about: Object,
  projects: Array,
  things: Array,   // <-- new collection for "Things I Built"
  gallery: Array,
  building: Array,
  timeline: Array
}, { collection: 'site-data' });

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  msg: String,
  at: Number
}, { collection: 'messages' });

const SiteData = mongoose.model('SiteData', siteDataSchema);
const Message = mongoose.model('Message', messageSchema);

// ----- Default data (matching your frontend) -----
const DEFAULT_DATA = {
  settings: {
    name: 'Parshv',
    tagline: 'Developer · Builder · Explorer',
    accent: '#6e8bff',
    heroDesc: 'I build websites, software and experimental ideas — turning concepts into things people can actually use.',
    heroTag: '● AVAILABLE FOR PROJECTS',
    contactDesc: 'Got a project, a weird idea, or something that needs building? Send it over.',
    stack: 'JavaScript, Python, React, HTML, CSS, AI, Robotics, Next.js',
    github: 'https://github.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    youtube: 'https://youtube.com'
  },
  about: {
    headline: "I'm Parshv. A developer who likes building things — mostly at the edge of what I already know how to do.",
    age: 14,
    interests: 'AI, Robotics, Web',
    current: 'Building bigger projects',
    statProjects: '12+',
    statYears: '03+'
  },
  projects: [
    { id:'p1', name:'Paws Care', desc:'A platform designed to help connect stray animals with people who can foster or adopt them, with live location mapping.', category:'Web Development', tech:'Python, Flask, JavaScript, Chart.js, Leaflet', img:'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=1200', github:'https://github.com', live:'', featured:true },
    { id:'p2', name:'Student Platform', desc:'A place where students can get help exactly when they need it — questions, resources and peer support in one dashboard.', category:'Web Development', tech:'Next.js, PostgreSQL, Tailwind', img:'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200', github:'https://github.com', live:'', featured:true },
    { id:'p3', name:'AI Experiment', desc:'A small experiment training a model to classify handwritten notes and turn them into structured to-do lists.', category:'AI', tech:'Python, PyTorch', img:'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200', github:'https://github.com', live:'', featured:true },
    { id:'p4', name:'Robotics Project', desc:'A line-following robot built from scratch, with a custom PID controller tuned by hand over dozens of test runs.', category:'Robotics', tech:'C++, Arduino', img:'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200', github:'https://github.com', live:'', featured:true }
  ],
  things: [
    { id:'t1', name:'Chat App', desc:'Real-time messaging app with websockets.', category:'Web Development', tech:'Node.js, Socket.io, React', img:'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800', github:'https://github.com', live:'' },
    { id:'t2', name:'Music Bot', desc:'Discord bot that plays music from YouTube.', category:'Experiment', tech:'Python, Discord.py', img:'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=800', github:'https://github.com', live:'' }
  ],
  gallery: [
    { id:'g1', caption:'UI concept', img:'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800' },
    { id:'g2', caption:'Robotics build', img:'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800' },
    { id:'g3', caption:'Competition day', img:'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=800' },
    { id:'g4', caption:'Late night coding', img:'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800' },
    { id:'g5', caption:'AI experiment output', img:'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800' },
    { id:'g6', caption:'Sketch to screen', img:'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800' }
  ],
  building: [
    { id:'b1', name:'Student Platform', desc:'Building a platform where students can get help when they need it.', pct:80 },
    { id:'b2', name:'Robotics v2', desc:'Rebuilding the line follower with a smarter sensor array and a faster PID loop.', pct:45 }
  ],
  timeline: [
    { id:'tl1', year:'2023', text:'Started coding', now:false },
    { id:'tl2', year:'2024', text:'Built first major projects', now:false },
    { id:'tl3', year:'2025', text:'Started exploring AI', now:false },
    { id:'tl4', year:'2026', text:'Building bigger projects', now:true }
  ]
};

// ----- API Routes -----
app.get('/api/site-data', async (req, res) => {
  try {
    let data = await SiteData.findOne();
    if (!data) {
      data = new SiteData(DEFAULT_DATA);
      await data.save();
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/site-data', async (req, res) => {
  try {
    await SiteData.findOneAndUpdate({}, req.body, { upsert: true, new: true });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const msgs = await Message.find().sort({ at: -1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const msg = new Message(req.body);
    await msg.save();
    res.sendStatus(201);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- Serve static frontend (your index.html) -----
app.use(express.static(__dirname));

// ----- Start server -----
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });