// Đảm bảo toàn bộ cấu trúc giao diện HTML của trang Phá Kén 1 được tải xong mới chạy
document.addEventListener('DOMContentLoaded', () => {
    
    // --- KHỞI TẠO BIẾN ĐIỀU KHIỂN MENU 3 GẠCH ---
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');

    if (menuToggle && menu) {
        // 1. Lắng nghe sự kiện click vào nút 3 gạch để bật/tắt menu
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Ngăn chặn sự kiện nổi bọt làm đóng menu lập tức
            menu.classList.toggle('active');
        });

        // 2. Mẹo UX tinh tế: Nếu click trượt ra ngoài vùng menu, tự động thu menu lại
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
                menu.classList.remove('active');
            }
        });
    }
    window.togglePlay = function() {
        var video = document.getElementById("myVideo");
        var btn = document.querySelector(".play-btn");

        if (video.paused) {
            video.play();
            btn.style.display = "none";
            video.setAttribute("controls", "true");
        }
    };
    function togglePlay() {
        var video = document.getElementById("myVideo");
        var btn = document.querySelector(".play-btn");

        if (video.paused) {
            video.play();
            btn.style.display = "none"; // Ẩn nút khi đang phát
            video.setAttribute("controls", "true"); // Hiện thanh công cụ khi video chạy
        }
    }
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');

    function showSlides() {
        slides.forEach(slide => slide.style.opacity = 0); // Ẩn hết
        currentSlide = (currentSlide + 1) % slides.length; // Chuyển sang ảnh tiếp theo
        slides[currentSlide].style.opacity = 1; // Hiện ảnh mới
    }

    // Chạy ngay khi tải xong
    if(slides.length > 0) {
        slides[0].style.opacity = 1;
        setInterval(showSlides, 6000); 
    }
});
