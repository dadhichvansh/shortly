# 🔗 URL Shortener - Node.js

A simple URL shortener application built using **Node.js** for the backend and **HTML/CSS/JS** for the frontend. This project allows users to shorten long URLs into a custom or randomly generated short code and access them later using that code.

## 🚀 Features

- Shorten long URLs with optional custom short codes
- Automatically generate unique short codes if none is provided
- Stores data persistently in a local `links.json` file
- Fully functional frontend interface for user input and display
- Minimalistic and responsive UI

## 🛠️ Tech Stack

- **Backend**: Node.js (HTTP module, fs/promises, crypto)
- **Frontend**: HTML, CSS, JavaScript
- **Storage**: JSON file (local filesystem)

## 📁 Project Structure

```bash
url-shortener-nodejs/
│
├── data/
│ └── links.json # Stores URL and short code mapping
│
├── public/
│ ├── index.html # Frontend UI
│ ├── style.css # Styling
│ └── script.js # Frontend JS logic
│
├── src/
│ └── main.js # Backend HTTP server
│
├── package.json # (Optional) For npm dependencies if added
└── README.md # Project documentation
```

## 📦 Installation

1. **Clone the repository**

```bash
git clone https://github.com/dadhichvansh/url-shortener-nodejs.git
cd url-shortener-nodejs
```

2. **Install dependencies (if using any like nodemon)**

```bash
npm install
```

3. **Start the server**

```bash
- npm start - to start the server
- npm run dev - to start the server in development mode
```

4. **Open in browser**

Navigate to: http://localhost:3000

## 🧪 Usage

- Enter a long URL in the input field.
- Optionally, provide a custom short code.
- Click "Shorten".
- Use the generated short URL to access the original link.

## 🧹 Future Improvements

- Add database support (e.g., MongoDB or SQLite)
- Implement user authentication
- Track analytics like click count
- Add expiry dates to short links

## 📄 License

This project is licensed under the MIT License.

Made with 💻 by [Vansh Dadhich]()
