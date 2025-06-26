
# 🎉 CollabDocs

> This is CollabDocs! A real-time collaborative document editor built with React, Yjs, Quill and Golang.


## 🚀 Live Demo

Check out the live version here: **[https://www.collabdoc.xyz](https://www.collabdoc.xyz)**


## 🚀 Why I Built This

> We've all used tools like Google Docs—but what if you could have the same experience with full control over your data, privacy, and deployment?

I built CollabDocs because:

* I wanted to learn how collaborative systems work under the hood
* I wanted an alternative that is open, hackable, and looks great
* I wanted to build a full-stack app that solve real problems



## 🛠️ Architecture & Technology Stack

| Layer              | Technologies                                                |
|--------------------|-------------------------------------------------------------|
| **Frontend**       | React, Vite, Zustand, Tailwind CSS                        |
| **Backend**        | Go , SQLC, Goose                                 |
| **Database**       | PostgreSQL                                                  |
| **Real-time Sync** | Yjs, Quill, y-websocket                                     |
| **Authentication** | JWT & Refresh Token                                |
| **Deployment**     | AWS EC2 (t2.micro) for backend • Vercel for frontend
 

     

## 📁 Project Structure
```
collabDocs/
├── .gitignore
├── README.md
├── backend/                 
│   ├── .env
│   ├── go.mod
│   ├── go.sum
│   ├── main.go
│   ├── handlers*            
│   ├── internal/
│   │       ├──auth/            
│   ├──database/        
│   ├── middleware/
│   │      ├──cors.go
│   ├──sql/          
│       ├──schema/
│       ├──queries/
└── frontend/                
│  ├── .env
│  ├── package.json
│  ├── package.lock.json
│  ├── vite.config.js
│  ├── vercel.config	
│  ├── src/
│  │     ├── main.jsx
│  │     ├── components/
│  │     ├── pages/
│  │     ├── services/        
│  │     ├──store/          

```

## ✨ Key Features

- **Real-Time Collaboration**: Yjs + y-websocket for instant multi-user editing  
- **Offline Support**: Seamless editing even without internet; syncs when back online  
- **User Presence & Awareness**: See who’s online and where they’re editing in real time 
- **Rich Text Editing**: Quill.js Editor
-  **Robust Backend & Database**: Go , SQLC for type-safe queries, Goose for migrations  
- **Secure Auth Flow**: JWT access & refresh tokens, CORS  
- **Document Sharing**: Tokenized URLs with view/edit permissions  
- **Responsive UI**: Tailwind CSS + Framer Motion for smooth animations 
- **Dark & Beautiful Theme**: Elegant dark mode UI for a focused writing experience 
- **Deployment**: AWS EC2 (t2.micro) for backend • Vercel for frontend  



## 🛠️ Installation


### 🖥️ Backend Setup

1. **Clone & enter**  
   ``` bash
   git clone https://github.com/Swapnilgupta8585/collabDocs.git
   cd collabDocs/backend
   ```
2. **Install dependencies & generate DB code**

```bash
go mod download
sqlc generate 
```
3. **Environment variables**

* Copy the template and populate your secrets:
```
cp .env.example .env
```
* **Edit backend/.env**
```
PORT=5000
DB_URL=postgres://<db-user>:<db-pass>@localhost:5432/collabdoc?sslmode=disable
SECRET_TOKEN=your_jwt_secret
PLATFORM=dev
```

4. **Create the database**
* If you don’t already have the “collabdoc” DB, run:

```
createdb collabdoc
```


5. **Run the server**
```
go run main.go
```

> Your API will be available at http://localhost:5000.


### 🌐 Frontend Setup

1. **Enter the frontend folder**

```
cd ../frontend
```

2. **Install dependencies**
```
npm install
```

3. **Environment variables**

```
cp .env.example .env
```

Then edit **frontend/.env**:
```
VITE_API_URL=http://localhost:5000/api
```

4. **Run the dev server**
```
npm run dev
```

> By default Vite serves at http://localhost:5173.


## 🎯 Usage

  

*  **Create a new document**: Click **+ New Document** on the dashboard.

*  **Share**: Open the **Share** dialog, generate a token, and send the link to collaborators.

*  **Collaborate**: Multiple users can join the same URL and see live edits.


## 🤝 Contributing

  

Contributions are welcome! Please follow these steps:

  

1. Fork the repo

2. Create a feature branch (`git checkout -b feature/YourFeature`)

3. Commit your changes (`git commit -m 'Add some feature'`)

4. Push to the branch (`git push origin feature/YourFeature`)

5. Open a Pull Request


## 📫 Contact

**Swapnil Gupta** - [@Swapnilgupta8585](https://github.com/Swapnilgupta8585)






  



  
