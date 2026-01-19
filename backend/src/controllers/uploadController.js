const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createError, success } = require('../utils/responseHandler');

// Map categories to directories
const DIR_MAP = {
    'fitting-input': 'clothes/inputs',
    'fitting-result': 'clothes/results',
    'profile': 'users/profiles',
    'brand-logo': 'brands/logos',
    'cloth-design': 'clothes/results', // designs are technically results of design process
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const category = req.params.category;
        const subDir = DIR_MAP[category] || 'others';
        const uploadPath = path.join(__dirname, '../../uploads', subDir);

        // Ensure directory exists
        fs.mkdirSync(uploadPath, { recursive: true });

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

exports.uploader = upload.single('file');

exports.uploadFile = (req, res, next) => {
    if (!req.file) {
        return next(createError(400, '파일이 업로드되지 않았습니다.'));
    }

    const category = req.params.category;
    const subDir = DIR_MAP[category] || 'others';

    // Return the public URL
    const fileUrl = `/uploads/${subDir}/${req.file.filename}`;

    return success(res, { url: fileUrl });
};
