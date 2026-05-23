import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getFirestore, collection, addDoc, query, orderBy, where, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- 1. CẤU HÌNH FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyC7BBc13wFAe73OrR-0qvwej7e8tARaJ1I",
    authDomain: "test01-34e19.firebaseapp.com",
    projectId: "test01-34e19",
    storageBucket: "test01-34e19.firebasestorage.app",
    messagingSenderId: "88182153733",
    appId: "1:88182153733:web:fed599711e576454a8726c",
    measurementId: "G-J7T1M2Q1D2"
};

const CLOUD_NAME = "dkn0v4yv2"; 
const UPLOAD_PRESET = "phaken_preset"; 

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Biến toàn cục để "chốt" tên người dùng sau khi họ bấm Bắt đầu
let currentVisitorName = "";

document.addEventListener('DOMContentLoaded', () => {
    
    // --- [A] MENU MOBILE (3 GẠCH) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');

    if (menuToggle && menu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
                menu.classList.remove('active');
            }
        });
    }

    // --- [B] LƯU TÊN VÀ "MỞ KHÓA" FORM UPLOAD ---
    const startBtn = document.querySelector('.start-btn');
    const nameInput = document.getElementById('visitorName');
    const uploadSection = document.getElementById('uploadSection'); // Trỏ tới form upload đang bị ẩn

    if (startBtn && nameInput) {
        startBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const userName = nameInput.value.trim();

            if (userName === "") {
                return Swal.fire({
                    title: 'Tên của cậu là...',
                    text: 'Hãy để lại một cái tên để mình biết cậu vừa ghé thăm nhé!',
                    icon: 'question',
                    confirmButtonColor: '#d4af37',
                    background: '#050b14', color: '#fff'
                });
            }

            try {
                Swal.fire({
                    title: 'Đang mở kén...',
                    html: 'Vũ trụ đang ghi nhớ tên cậu...',
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading(); }
                });

                await addDoc(collection(db, "visitors"), {
                    ten_nguoi_dung: userName,
                    ngay_gui: new Date()
                });

                // Chốt tên vào biến hệ thống để lát nữa lấy đem đi upload
                currentVisitorName = userName;

                Swal.fire({
                    title: `Chào mừng ${userName}!`,
                    html: 'Chúc cậu có một hành trình thật nhẹ nhàng tại <b>Phá Kén</b>. ✨',
                    icon: 'success',
                    confirmButtonText: 'BẮT ĐẦU THÔI ✦',
                    confirmButtonColor: '#d4af37',
                    background: '#050b14', color: '#fff'
                }).then(() => {
                    // HIỆU ỨNG MỞ KHÓA: Sau khi tắt thông báo, hiện form upload và cuộn tới đó
                    if (uploadSection) {
                        uploadSection.style.display = 'block'; // Hiển thị form
                        // Delay nhẹ 1 chút để DOM kịp render trước khi cuộn
                        setTimeout(() => {
                            uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 150);
                    }
                });

            } catch (err) {
                console.error(err);
                Swal.fire('Lỗi rồi!', 'Vũ trụ đang gặp sự cố, thử lại sau nhé!', 'error');
            }
        });
    }

    // --- [C] XỬ LÝ KHUNG TẢI FILE XEM TRƯỚC ---
    const fileInput = document.getElementById('imgFile');
    const placeholder = document.getElementById('previewPlaceholder');
    const imgPreview = document.getElementById('imagePreview');
    const videoPreview = document.getElementById('videoPreview');
    const fileNameDisplay = document.getElementById('file-name-display');

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            imgPreview.style.display = 'none'; videoPreview.style.display = 'none'; videoPreview.src = ''; placeholder.style.display = 'block';
            if (file) {
                const fileType = file.type;
                const fileUrl = URL.createObjectURL(file);
                fileNameDisplay.innerHTML = `✨ Đã nhận: <b>${file.name}</b>`;
                fileNameDisplay.style.color = '#f6d28d';
                placeholder.style.display = 'none';
                if (fileType.startsWith('image/')) {
                    imgPreview.src = fileUrl; imgPreview.style.display = 'block';
                } else if (fileType.startsWith('video/')) {
                    videoPreview.src = fileUrl; videoPreview.style.display = 'block';
                }
            } else {
                fileNameDisplay.innerText = "Cậu chưa chọn khoảnh khắc nào...";
                fileNameDisplay.style.color = '#666';
            }
        });
    }

    // --- [D] UPLOAD LÊN CLOUDINARY KÈM TÊN ĐÃ "CHỐT" ---
    const btnUpload = document.getElementById('btnUpload');
    const imgTitle = document.getElementById('imgTitle');

    if (btnUpload) {
        btnUpload.onclick = async () => {
            const file = fileInput.files[0];
            const title = imgTitle.value.trim();
            
            // Lấy tên đã được lưu lúc bấm Bắt Đầu Hành Trình
            const author = currentVisitorName;

            if (!author) {
                return Swal.fire({
                    title: 'Khoan đã...',
                    text: 'Hình như cậu chưa bấm "Bắt đầu hành trình" ở trên cùng thì phải?',
                    icon: 'warning',
                    confirmButtonColor: '#d4b06a',
                    background: '#050b14', color: '#fff'
                });
            }

            if (!file || !title) {
                return Swal.fire({
                    title: 'Thiếu thông tin!',
                    text: 'Cậu nhập đầy đủ tiêu đề và chọn file trước khi thả vào Galaxy nhé!',
                    icon: 'warning',
                    confirmButtonColor: '#d4b06a',
                    background: '#050b14', color: '#fff'
                });
            }

            Swal.fire({
                title: 'Thả vào Vũ trụ?',
                html: `
                    <div style="text-align: left; padding: 12px; background: rgba(212,176,106,0.1); border: 1px solid rgba(212,176,106,0.3); border-radius: 10px;">
                        <p style="margin-bottom: 8px; color: #fff;"><b>✦ Tác giả:</b> ${author}</p>
                        <p style="margin-bottom: 8px; color: #fff;"><b>✦ Tiêu đề:</b> ${title}</p>
                        <p style="margin-bottom: 0; font-size: 0.85rem; color: #aaa;"><b>✦ File:</b> ${file.name}</p>
                    </div>
                    <br><span style="font-size: 0.9rem;">Cậu có chắc muốn thả khoảnh khắc này không?</span>`,
                icon: 'question',
                showCancelButton: true, confirmButtonColor: '#d4b06a', cancelButtonColor: '#333', confirmButtonText: 'Thả ngay! ✨',
                background: '#050b14', color: '#fff'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        btnUpload.innerText = `ĐANG BAY VÀO GALAXY...`;
                        btnUpload.disabled = true;

                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('upload_preset', UPLOAD_PRESET);

                        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: 'POST', body: formData });
                        const resultUpload = await res.json();

                        if (resultUpload.secure_url) {
                            await addDoc(collection(db, "moments"), {
                                author: author, 
                                title: title,
                                url: resultUpload.secure_url,
                                public_id: resultUpload.public_id,
                                type: resultUpload.resource_type,
                                status: "pending",
                                createdAt: new Date()
                            });

                            Swal.fire({
                                title: 'Đã gửi đi!',
                                text: 'Khoảnh khắc của cậu đang chờ được kiểm duyệt để lấp lánh trong Galaxy nhé! ✨',
                                icon: 'success', confirmButtonColor: '#d4b06a', background: '#050b14', color: '#fff'
                            });

                            imgTitle.value = ""; fileInput.value = "";
                            imgPreview.style.display = 'none'; videoPreview.style.display = 'none';
                            placeholder.style.display = 'block';
                            fileNameDisplay.innerText = "Cậu chưa chọn khoảnh khắc nào...";
                            fileNameDisplay.style.color = '#666';
                        }
                    } catch (error) {
                        console.error(error);
                        Swal.fire('Lỗi rồi!', 'Vũ trụ đang gặp sự cố, thử lại sau nhé!', 'error');
                    } finally {
                        btnUpload.innerText = "✦ THẢ VÀO VŨ TRỤ GALAXY ✦";
                        btnUpload.disabled = false;
                    }
                }
            });
        };
    }

    // --- [E] HIỂN THỊ REAL-TIME KÈM TÊN ---
    const videoGrid = document.getElementById('videoGrid');
    const imageGrid = document.getElementById('imageGrid');

    if (videoGrid) {
        const qVideo = query(collection(db, "moments"), where("status", "==", "approved"), where("type", "==", "video"), orderBy("createdAt", "desc"));
        onSnapshot(qVideo, (snapshot) => {
            videoGrid.innerHTML = ""; 
            if (snapshot.empty) return videoGrid.innerHTML = `<p style="color:#444; text-align:center; grid-column:1/-1; font-family:'Montserrat', sans-serif; font-style:italic;">Chưa có thước phim nào được ghi lại... ✨</p>`;
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const authorName = data.author ? data.author : "Người ẩn danh";
                videoGrid.innerHTML += `
                    <div class="gallery-card">
                        <video src="${data.url}" controls preload="metadata" style="width: 100%; height: 260px; object-fit: cover; background: #000;"></video>
                        <div class="card-content">
                            <h3>${data.title}</h3>
                            <p style="color: var(--gold-light); font-weight: 600; margin-bottom: 5px; font-style: normal !important;">✦ Bởi: ${authorName}</p>
                            <p>✦ ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString('vi-VN') : 'Vừa xong'}</p>
                        </div>
                    </div>
                `;
            });
        });
    }

    if (imageGrid) {
        const qImage = query(collection(db, "moments"), where("status", "==", "approved"), where("type", "==", "image"), orderBy("createdAt", "desc"));
        onSnapshot(qImage, (snapshot) => {
            imageGrid.innerHTML = ""; 
            if (snapshot.empty) return imageGrid.innerHTML = `<p style="color:#444; text-align:center; grid-column:1/-1; font-family:'Montserrat', sans-serif; font-style:italic;">Chưa có bức hình nào lấp lánh tại đây... ✨</p>`;
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const authorName = data.author ? data.author : "Người ẩn danh";
                imageGrid.innerHTML += `
                    <div class="gallery-card">
                        <img src="${data.url}" style="width: 100%; height: 260px; object-fit: cover;">
                        <div class="card-content">
                            <h3>${data.title}</h3>
                            <p style="color: var(--gold-light); font-weight: 600; margin-bottom: 5px; font-style: normal !important;">✦ Bởi: ${authorName}</p>
                            <p>✦ ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString('vi-VN') : 'Vừa xong'}</p>
                        </div>
                    </div>
                `;
            });
        });
    }
});