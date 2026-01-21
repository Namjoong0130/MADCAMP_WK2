/* 
모든 미들웨어(보안, 데이터 해석 등)와 라우터를 통합하는 역할을 합니다.
*/

const express = require('express'); //express = 도구 
const cors = require('cors'); //프런트엔드 통신
const dotenv = require('dotenv'); //.env 접근
const routes = require('./routes'); // index.js를 자동으로 찾음 (./routes -> 그 안의 index.js)
const { errorMiddleware } = require('./middlewares/errorMiddleware');
const path = require('path');

dotenv.config(); //.env 접근

const app = express();

// --- CORS 설정 ---
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) return callback(null, true);

    // List of allowed origins
    const allowedOrigins = [
      'http://172.10.5.178',
      'http://172.10.5.178:80',
      'http://172.10.5.178:5173', // Vite dev server
      'http://localhost:5173',
      'http://localhost:3000',
    ];

    // Add custom origin from environment variable if set
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(null, true); // Allow in development, for production set to: callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // Cache preflight request for 10 minutes
};

// --- 미들웨어 설정 ---
app.use(cors(corsOptions)); // 프론트엔드와의 통신 허용 (SOP, Same-Origin Policy 문제 우회)
app.use(express.json()); // JSON 형태의 요청 본문 해석
app.use(express.urlencoded({ extended: true })); //주소창 데이터 번역

// --- 라우터 연결 ---
app.use('/api/images', express.static(path.join(__dirname, '../public/images'))); // Serve images folder statically under /api/images to bypass Nginx root routing
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve uploaded files (legacy/misc)
app.use('/api', routes); //주소창에 /api로 시작하는 모든 요청은 routes/index.js 설계도에 따라 처리해라

// Swagger Docs (Available at /api-docs)
const { swaggerUi, specs } = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// --- 에러 처리 미들웨어 (가장 마지막에 위치) ---
app.use(errorMiddleware); //앞선 단계들(로그인, 옷 등록 등)에서 에러가 발생하면, 이 미들웨어가 그 에러를 잡아내서 사용자에게 "로그인에 실패했습니다" 같은 깔끔한 응답을 보내줍니다.

module.exports = app; //app 설계도를 외부로 내보냅니다. 아까 작성하신 server.js에서 require('./src/app')를 통해 이 설계도를 가져가서 서버를 실제로 가동
