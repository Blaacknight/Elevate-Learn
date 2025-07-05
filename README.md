
# 📚 Learning Management System (LMS)

A full-stack Learning Management System (LMS) for modern online learning — combining user management, course tracking, real-time chat, and online code execution.

## 🚀 Tech Stack

**Backend:** Node.js · Express.js · MongoDB · Socket.IO · JWT · Multer · Puppeteer  
**Frontend:** Angular · Tailwind CSS · Chart.js · ECharts · ngx-toastr

---



## ⚙️ Environment Variables

Create an `.env` in `lms-backend/`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lms-db
JWT_SECRET=supersecretkey
JUDGE0_API_KEY=<your_judge0_api_key>
```


## ✅ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone <repo-url>
cd <repo-folder>
```

### 2️⃣ Install Dependencies

```bash
# Backend
cd lms-backend
npm install

# Frontend
cd ../lms-frontend
npm install
```

### 3️⃣ Start MongoDB

Make sure MongoDB is running locally:

```bash
mongod
```

### 4️⃣ Run Backend

```bash
cd lms-backend
npm start
```

The backend runs on **http://localhost:5000**.

**Default Admin:**  
- Email: `admin@lms.com`  
- Password: `admin`

### 5️⃣ Run Frontend

```bash
cd lms-frontend
npm start
```

The frontend runs on **http://localhost:4200**.

---

## 🔌 Key API Endpoints

| Purpose      | Endpoint                |
|--------------|-------------------------|
| Auth         | `/api/auth`             |
| Courses      | `/api/courses`          |
| Materials    | `/api/materials`        |
| Progress     | `/api/progress`         |
| Sections     | `/api/sections`         |
| Dashboard    | `/api/dashboard`        |
| Certificates | `/api/certificates`     |
| Assignments  | `/api/assignments`      |
| Classrooms   | `/api/classrooms`       |
| Real-time Chat | Socket.IO at `/` |

---

## 💬 Real-Time Chat

Socket.IO is used for live messaging: clients connect to **http://localhost:5000** and exchange messages in real-time.

---

## ⚡ Build Frontend for Production

```bash
cd lms-frontend
npm run build
```

The production build is generated in `dist/lms-frontend`.

---

## ⚠️ Notes

- Replace the Judge0 API key for live code execution.
- File uploads are available under `/uploads`.
- Adjust CORS origins if deploying.

---

## 👨‍💻 Author

**Your Name Here** — [GitHub](https://github.com/Blaacknight)

---

## 📝 License

This project is licensed under the **ISC License**.

---

## 📢 Contributing

Pull requests, feature requests, and ideas are welcome! 🚀

---

**Happy Learning! 🎓**
