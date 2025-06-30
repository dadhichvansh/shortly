# 🔗 URL Shortener - Express.js

A simple URL shortener application built using **Express.js** for the backend and **HTML/CSS** for the frontend. This project allows users to shorten long URLs into a custom or randomly generated short code and access them later using that code.

## 🚀 Features

- Shorten long URLs with optional custom short codes
- Automatically generate unique short codes if none is provided
- Stores data persistently in a local `links.json` file
- Fully functional frontend interface for user input and display
- Minimalistic and responsive UI

## 🛠️ Tech Stack

- **Backend**: Express.js (fs/promises, crypto)
- **Frontend**: HTML, CSS
- **Storage**: JSON file (local filesystem)

## 📁 Project Structure

```bash
url-shortener-nodejs/
│
├── data/
│ └── links.json # Stores URL and short code mapping
│
├── public/
│ └── style.css # Styling
│
├── views/
│ └── index.html # Frontend UI
│
├── main.js # Backend server
├── validation.js # PORT validation
│
├── package.json # For npm dependencies
└── README.md # Project documentation
```

## 📦 Installation

1. **Clone the repository**

```bash
git clone https://github.com/dadhichvansh/url-shortener-expressjs.git
cd url-shortener-nodejs
```

2. **Install dependencies (if using any like nodemon)**

```bash
npm install
```

3. **Set up environment variables**

- If you need to set any environment variables, create a `.env` file in the root directory.
- For example, you can set the `PORT` variable to change the server port:

```bash
PORT=3000
```

You can see `.env.example` for reference.

4. **Start the server**

```bash
- npm start - to start the server
- npm run dev - to start the server in development mode
```

5. **Open in browser**

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
