# Parshv.dev – Portfolio Backend

This is the Node.js + Express + MongoDB backend for the Parshv portfolio site.

## 🚀 Local development

1. Clone the repository.
2. Install dependencies: `npm install`
3. Create a `.env` file with your MongoDB URI (see `.env.example`).
4. Run the server: `npm start`
5. Visit `http://localhost:3000` to see the site.

## 🌐 Deploy on Render

1. Push this repository to GitHub.
2. On Render, create a new **Web Service**.
3. Connect your GitHub repo.
4. Set the following:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**: add `MONGODB_URI` with your Atlas connection string.
5. Deploy and you're done!

## 📡 API Endpoints

- `GET /api/site-data` – fetch all site content.
- `POST /api/site-data` – update site content (full object).
- `GET /api/messages` – list all contact messages.
- `POST /api/messages` – submit a new message.
- `DELETE /api/messages/:id` – delete a message.

## 📂 Data Structure

The data is stored in two collections:
- `site-data`: a single document containing the entire site state.
- `messages`: each contact form submission.

## 🛠 Built with

- Express
- Mongoose
- MongoDB Atlas
- dotenv