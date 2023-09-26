const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs');
const multer = require('multer');

app.use(cors());
app.use(express.json());

// Multer konfiguratsiyasi
const storage = multer.diskStorage({
    destination: 'uploads/', // Fayllar qayerga saqlanishi kerakligini o'zgartiring
    filename: function (req, file, cb) {
        // Fayl nomini o'zgartirish uchun qo'shimcha funksiya
        const ext = file.originalname.split('.').pop();
        cb(null, file.fieldname + '-' + Date.now() + '.' + ext);
    },
});

const upload = multer({ storage: storage });

app.post('/comment', upload.single('image'), (req, res) => {
    const {
        xona_count,
        xona_tozaligi_star,
        nonushta_star,
        RECEPTION_star,
        restoran_star,
        basseyn_star,
        comment,
    } = req.body;

    const newComment = {
        xona_count,
        xona_tozaligi_star,
        nonushta_star,
        RECEPTION_star,
        restoran_star,
        basseyn_star,
        comment,
        image: req.file ? req.file.filename : null, // Fayl nomini saqlash
    };

    console.log(newComment);

    // Ma'lumotlarni "usercomment.json" fayliga yozish
    const comments = JSON.parse(fs.readFileSync('usercomment.json', 'utf-8'));
    comments.push(newComment);
    fs.writeFileSync('usercomment.json', JSON.stringify(comments, null, 2));

    res.end('ok');
});
// ...

// GET so'rovi uchun "/get-comment" yo'nalishi
app.get('/comment', (req, res) => {
    // "usercomment.json" faylini o'qiyap, uni JSON formatida obyektlarga o'zgartiramiz
    const comments = JSON.parse(fs.readFileSync('usercomment.json', 'utf-8'));
    res.json(comments);
});

// GET so'rovi uchun "/get-image" yo'nalishi
app.get('/image/:filename', (req, res) => {
    const filename = req.params.filename;
    // "uploads" papkasidagi faylni o'qib olish uchun Express.js "sendFile" metodidan foydalanamiz
    res.sendFile(__dirname + '/uploads/' + filename);
});

// ...

// GET so'rovi uchun "/get-one-comment" yo'nalishi
app.get('/comment/:id', (req, res) => {
    const id = req.params.id;
    const comments = JSON.parse(fs.readFileSync('usercomment.json', 'utf-8'));
    const comment = comments.find((c) => c.id === id); // "id" bo'yicha qidirish
    if (comment) {
        res.json(comment);
    } else {
        res.status(404).json({ message: 'Komment topilmadi' });
    }
});

// DELETE so'rovi uchun "/delete-comment" yo'nalishi
app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    let comments = JSON.parse(fs.readFileSync('usercomment.json', 'utf-8'));
    const commentIndex = comments.findIndex((c) => c.id === id); // "id" bo'yicha qidirish
    if (commentIndex !== -1) {
        comments.splice(commentIndex, 1); // Kommentni o'chirish
        fs.writeFileSync('usercomment.json', JSON.stringify(comments, null, 2));
        res.json({ message: 'Komment o\'chirildi' });
    } else {
        res.status(404).json({ message: 'Komment topilmadi' });
    }
});

app.listen(5000, () => {
    console.log(`Server is running at http://localhost:${5000}/`);
});
