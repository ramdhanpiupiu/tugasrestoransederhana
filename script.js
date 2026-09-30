/* =====================================================
   SCRIPT.JS — Interaksi Website Restoran Sederhana
   Ditulis dengan JavaScript murni (vanilla JS).
   Semua interaksi dipasang lewat addEventListener,
   tidak ada JavaScript yang ditulis di dalam index.html.
   ===================================================== */

(function () {
    "use strict";

    /* Nomor WhatsApp restoran (dipakai untuk semua tombol pesan) */
    var NOMOR_WA = "6281234567890";

    /* ---------- 1. HAMBURGER MENU (NAVBAR MOBILE) ---------- */
    var hamburger = document.getElementById("hamburger");
    var navMenu = document.getElementById("nav-menu");

    // Fungsi membuka/menutup menu mobile
    function toggleMenu() {
        var terbuka = navMenu.classList.toggle("terbuka");
        hamburger.classList.toggle("buka", terbuka);
        // aria-expanded membantu pembaca layar (aksesibilitas)
        hamburger.setAttribute("aria-expanded", terbuka ? "true" : "false");
    }

    // Fungsi menutup menu (dipakai klik di luar, Escape, dan klik link)
    function tutupMenu() {
        navMenu.classList.remove("terbuka");
        hamburger.classList.remove("buka");
        hamburger.setAttribute("aria-expanded", "false");
    }

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", toggleMenu);

        // Tutup menu otomatis setelah salah satu link diklik
        navMenu.addEventListener("click", function (event) {
            if (event.target.tagName === "A") {
                tutupMenu();
            }
        });

        // Klik di luar navbar menutup menu
        document.addEventListener("click", function (event) {
            if (!navMenu.classList.contains("terbuka")) {
                return;
            }
            if (!navMenu.contains(event.target) && !hamburger.contains(event.target)) {
                tutupMenu();
            }
        });

        // Tombol Escape menutup menu
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && navMenu.classList.contains("terbuka")) {
                tutupMenu();
                hamburger.focus();
            }
        });

        // Jika layar diperbesar kembali ke ukuran desktop, reset keadaan menu
        window.addEventListener("resize", function () {
            if (window.innerWidth > 768) {
                tutupMenu();
            }
        });
    }

    /* ---------- 2. SMOOTH SCROLLING ---------- */
    // Semua link yang berawalan "#" akan digulir halus ke bagian tujuannya.
    var semuaLink = document.querySelectorAll('a[href^="#"]');

    semuaLink.forEach(function (link) {
        link.addEventListener("click", function (event) {
            var idTujuan = link.getAttribute("href");

            // Lewati link kosong seperti href="#"
            if (idTujuan === "#" || idTujuan.length < 2) {
                return;
            }

            var tujuan = document.querySelector(idTujuan);
            if (tujuan) {
                event.preventDefault();
                // scrollIntoView = gulir halus ke elemen tujuan
                tujuan.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    /* ---------- 3. TOMBOL "PESAN VIA WHATSAPP" ---------- */
    // Setiap tombol ber-class "js-whatsapp" punya atribut data-pesan
    // yang berisi teks pesanan otomatis.
    var tombolWhatsApp = document.querySelectorAll(".js-whatsapp");

    tombolWhatsApp.forEach(function (tombol) {
        tombol.addEventListener("click", function (event) {
            event.preventDefault();

            var pesan = tombol.getAttribute("data-pesan") || "Halo Restoran Sederhana!";
            bukaWhatsApp(pesan);
        });
    });

    // Fungsi membuat link WhatsApp dari teks pesan, lalu membukanya di tab baru
    function bukaWhatsApp(pesan) {
        var link = "https://wa.me/" + NOMOR_WA + "?text=" + encodeURIComponent(pesan);
        window.open(link, "_blank", "noopener");
    }

    /* ---------- 4. TOMBOL KEMBALI KE ATAS (BACK TO TOP) ---------- */
    var tombolKeAtas = document.getElementById("tombol-ke-atas");

    if (tombolKeAtas) {
        tombolKeAtas.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    /* ---------- 5. HIGHLIGHT MENU NAVBAR SESUAI SECTION ---------- */
    // Semua section yang id-nya sama dengan tujuan link navbar
    var sectionList = [];
    document.querySelectorAll(".nav-link").forEach(function (link) {
        var id = link.getAttribute("href").replace("#", "");
        var section = document.getElementById(id);
        if (section) {
            // Simpan pasangan section dan link navbar-nya
            sectionList.push({ link: link, section: section });
        }
    });

    function tandaiMenuAktif() {
        var posisiGulir = window.scrollY + 120; // 120 = tinggi navbar
        var sectionAktif = null;

        // Cari section terakhir yang sudah terlewati saat menggulir
        sectionList.forEach(function (item) {
            if (item.section.offsetTop <= posisiGulir) {
                sectionAktif = item;
            }
        });

        // Hapus warna aktif dari semua link, lalu pasang ke section aktif
        sectionList.forEach(function (item) {
            item.link.classList.remove("aktif");
        });
        if (sectionAktif) {
            sectionAktif.link.classList.add("aktif");
        }
    }

    /* ---------- 6. ANIMASI SAAT ELEMEN MASUK VIEWPORT ---------- */
    // IntersectionObserver = memantau apakah elemen sudah terlihat di layar.
    var elemenReveal = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("tampak");
                    observer.unobserve(entry.target); // animasi cukup sekali saja
                }
            });
        }, { threshold: 0.12 });

        elemenReveal.forEach(function (elemen) {
            observer.observe(elemen);
        });
    } else {
        // Cadangan untuk browser lama: langsung tampilkan semua elemen
        elemenReveal.forEach(function (elemen) {
            elemen.classList.add("tampak");
        });
    }

    /* ---------- 7. SATU EVENT SCROLL UNTUK DUA TUGAS ---------- */
    // Saat halaman digulir, kita:
    // (a) menampilkan/menyembunyikan tombol kembali ke atas,
    // (b) memperbarui highlight menu navbar.
    window.addEventListener("scroll", function () {
        if (tombolKeAtas) {
            if (window.scrollY > 300) {
                tombolKeAtas.classList.add("muncul");
            } else {
                tombolKeAtas.classList.remove("muncul");
            }
        }
        tandaiMenuAktif();
    });

    // Jalankan sekali saat halaman dibuka
    tandaiMenuAktif();

    /* ---------- 8. VALIDASI FORM PEMESANAN ---------- */
    var formPesan = document.getElementById("form-pesan");

    if (formPesan) {
        var inputNama = document.getElementById("nama");
        var inputTelepon = document.getElementById("telepon");
        var inputMenu = document.getElementById("menu");
        var inputJumlah = document.getElementById("jumlah");
        var inputCatatan = document.getElementById("catatan");
        var formSukses = document.getElementById("form-sukses");

        // Fungsi menampilkan pesan error di bawah input
        function tampilkanError(input, idError, teks) {
            document.getElementById(idError).textContent = teks;
            input.classList.add("input-salah");
            return false;
        }

        // Fungsi membersihkan pesan error
        function bersihkanError(input, idError) {
            document.getElementById(idError).textContent = "";
            input.classList.remove("input-salah");
            return true;
        }

        // Validasi seluruh isi form. Mengembalikan true jika semuanya benar.
        function validasiForm() {
            var valid = true;

            if (inputNama.value.trim().length < 3) {
                valid = tampilkanError(inputNama, "error-nama", "Nama minimal 3 karakter.");
            } else {
                bersihkanError(inputNama, "error-nama");
            }

            // Pola nomor telepon: hanya angka, spasi, tanda + dan -
            var polaTelepon = /^[0-9+\-\s]{9,16}$/;
            if (!polaTelepon.test(inputTelepon.value.trim())) {
                valid = tampilkanError(inputTelepon, "error-telepon", "Nomor WhatsApp tidak valid (9–16 angka).");
            } else {
                bersihkanError(inputTelepon, "error-telepon");
            }

            if (inputMenu.value === "") {
                valid = tampilkanError(inputMenu, "error-menu", "Silakan pilih salah satu menu.");
            } else {
                bersihkanError(inputMenu, "error-menu");
            }

            var jumlah = Number(inputJumlah.value);
            if (inputJumlah.value === "" || jumlah < 1 || jumlah > 20) {
                valid = tampilkanError(inputJumlah, "error-jumlah", "Jumlah harus antara 1 sampai 20.");
            } else {
                bersihkanError(inputJumlah, "error-jumlah");
            }

            return valid;
        }

        // Saat form dikirim: validasi dulu, lalu kirim lewat WhatsApp
        formPesan.addEventListener("submit", function (event) {
            event.preventDefault(); // cegah halaman reload

            if (!validasiForm()) {
                formSukses.textContent = "";
                return; // hentikan proses jika masih ada yang salah
            }

            // Susun teks pesanan
            var pesan = "Halo Restoran Sederhana! Saya mau pesan:\n"
                + "- Nama: " + inputNama.value.trim() + "\n"
                + "- Menu: " + inputMenu.value + "\n"
                + "- Jumlah: " + inputJumlah.value + " porsi\n"
                + "- No. WhatsApp: " + inputTelepon.value.trim();

            if (inputCatatan.value.trim() !== "") {
                pesan += "\n- Catatan: " + inputCatatan.value.trim();
            }

            bukaWhatsApp(pesan);

            formSukses.textContent = "Terima kasih, pesanan Anda siap dikirim melalui WhatsApp.";
            formPesan.reset();
        });

        // Hapus tanda error begitu pengguna mulai mengetik ulang
        inputNama.addEventListener("input", function () { bersihkanError(inputNama, "error-nama"); });
        inputTelepon.addEventListener("input", function () { bersihkanError(inputTelepon, "error-telepon"); });
        inputMenu.addEventListener("change", function () { bersihkanError(inputMenu, "error-menu"); });
        inputJumlah.addEventListener("input", function () { bersihkanError(inputJumlah, "error-jumlah"); });
    }

})();
