/* =====================================================
   SCRIPT.JS — Interaksi Website Restoran Sederhana
   Ditulis dengan JavaScript murni (vanilla JS).
   Semua interaksi dipasang lewat addEventListener,
   tidak ada JavaScript yang ditulis di dalam index.html.
   ===================================================== */

(function () {
    "use strict";

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
    // Semua link yang berawalan "#" akan digulir halus ke bagian tujuannya,
    // lalu fokus keyboard dipindahkan ke bagian tersebut (baik untuk keyboard/pembaca layar).
    var semuaLink = document.querySelectorAll('a[href^="#"]');

    semuaLink.forEach(function (link) {
        link.addEventListener("click", function (event) {
            var idTujuan = link.getAttribute("href");

            // Lewati link kosong seperti href="#"
            if (idTujuan === "#" || idTujuan.length < 2) {
                return;
            }

            var tujuan = null;
            try {
                tujuan = document.querySelector(idTujuan);
            } catch (e) {
                return; // selector tidak sah — biarkan perilaku default
            }

            if (tujuan) {
                event.preventDefault();
                // scrollIntoView = gulir halus ke elemen tujuan
                tujuan.scrollIntoView({ behavior: "smooth", block: "start" });
                // elemen dengan tabindex="-1" siap menerima fokus tanpa scroll ganda
                if (tujuan.hasAttribute("tabindex")) {
                    tujuan.focus({ preventScroll: true });
                }
            }
        });
    });

    /* ---------- 3. TOMBOL "PESAN" PADA KARTU MENU FAVORIT ---------- */
    // Tombol ini mengarah ke form pemesanan sekaligus langsung
    // mencentang paket menu yang bersangkutan di dalam form.
    var tombolPilihPaket = document.querySelectorAll(".js-pilih-paket");

    tombolPilihPaket.forEach(function (tombol) {
        tombol.addEventListener("click", function () {
            var idPaket = tombol.getAttribute("data-pilih");
            var checkbox = document.getElementById(idPaket);
            if (!checkbox) {
                return;
            }

            // Jika sebelumnya pesanan sudah dikirim (form tersembunyi,
            // ringkasan tampil), kembalikan dulu tampilan ke form agar
            // paket yang baru dipilih benar-benar terlihat.
            var form = document.getElementById("form-pesan");
            var ringkasan = document.getElementById("ringkasan-pesanan");
            if (form && ringkasan && !ringkasan.hidden) {
                ringkasan.hidden = true;
                form.hidden = false;
            }

            if (!checkbox.checked) {
                checkbox.checked = true;
                // panggil "change" supaya penanda error & ringkasan live ikut diperbarui
                checkbox.dispatchEvent(new Event("change", { bubbles: true }));
            }
        });
    });

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
            item.link.removeAttribute("aria-current");
        });
        if (sectionAktif) {
            sectionAktif.link.classList.add("aktif");
            // aria-current memberi tahu pembaca layar menu mana yang sedang aktif
            sectionAktif.link.setAttribute("aria-current", "true");
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

    /* ---------- 8. FORM PEMESANAN: VALIDASI, RINGKASAN LIVE, KIRIM ---------- */
    var formPesan = document.getElementById("form-pesan");

    if (formPesan) {
        var inputNama = document.getElementById("nama");
        var inputTelepon = document.getElementById("telepon");
        var inputTanggal = document.getElementById("tanggal");
        var inputNoKartu = document.getElementById("nokartu");
        var inputCatatan = document.getElementById("catatan");
        var radioKartu = document.getElementById("bayar-kartu");
        var radioDompet = document.getElementById("bayar-dompet");
        var detailKartu = document.getElementById("detail-kartu");
        var detailDompet = document.getElementById("detail-dompet");
        var daftarPaket = formPesan.querySelectorAll("input[name='paket']");
        var daftarDompet = formPesan.querySelectorAll("input[name='ewallet']");
        var errorPaket = document.getElementById("error-paket");
        var errorEwallet = document.getElementById("error-ewallet");
        var ringkasan = document.getElementById("ringkasan-pesanan");
        var ringkasanIsi = document.getElementById("ringkasan-isi");     // <tbody> tabel ringkasan
        var ringkasanSub = document.getElementById("ringkasan-sub");
        var ringkasanTotal = document.getElementById("ringkasan-total");
        var ringkasanInfo = document.getElementById("ringkasan-info");
        var ringkasanLagi = document.getElementById("ringkasan-lagi");
        var tombolKirim = formPesan.querySelector('button[type="submit"]');

        // Ringkasan live di dalam form
        var liveDaftar = document.getElementById("live-daftar");
        var liveItem = document.getElementById("live-item");
        var liveTotal = document.getElementById("live-total");

        // Fungsi menampilkan pesan error di bawah input
        function tampilkanError(input, idError, teks) {
            document.getElementById(idError).textContent = teks;
            input.classList.add("input-salah");
            input.setAttribute("aria-invalid", "true");
            return false;
        }

        // Fungsi membersihkan pesan error
        function bersihkanError(input, idError) {
            document.getElementById(idError).textContent = "";
            input.classList.remove("input-salah");
            input.setAttribute("aria-invalid", "false");
            return true;
        }

        // Format angka rupiah, mis. 23000 menjadi "Rp23.000"
        function formatRupiah(angka) {
            return "Rp" + angka.toLocaleString("id-ID");
        }

        // Tanggal hari ini menurut jam lokal (toISOString memakai UTC,
        // bisa salah tanggal di awal pagi WIB)
        function tanggalLokalISO(sekarang) {
            var bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
            var hari = String(sekarang.getDate()).padStart(2, "0");
            return sekarang.getFullYear() + "-" + bulan + "-" + hari;
        }

        // Tanggal booking tidak boleh sebelum hari ini
        var hariIni = tanggalLokalISO(new Date());
        inputTanggal.setAttribute("min", hariIni);

        // Tampilkan/sembunyikan detail isian sesuai metode pembayaran
        function toggleDetailBayar() {
            detailKartu.classList.toggle("sembunyi", !radioKartu.checked);
            detailDompet.classList.toggle("sembunyi", !radioDompet.checked);
            // bersihkan error metode yang baru disembunyikan agar tidak menumpuk
            if (!radioKartu.checked) {
                bersihkanError(inputNoKartu, "error-nokartu");
            } else {
                errorEwallet.textContent = "";
            }
        }
        radioKartu.addEventListener("change", toggleDetailBayar);
        radioDompet.addEventListener("change", toggleDetailBayar);
        toggleDetailBayar();

        // Format nomor kartu otomatis per 4 digit (contoh: 1234 5678 ...)
        inputNoKartu.addEventListener("input", function () {
            this.value = this.value
                .replace(/\D/g, "")
                .replace(/(.{4})/g, "$1 ")
                .trim()
                .slice(0, 19);
        });

        // Membaca paket yang dicentang beserta jumlah, input, dan harganya
        function ambilPaketTerpilih() {
            var terpilih = [];
            daftarPaket.forEach(function (cb) {
                if (cb.checked) {
                    var jumlah = document.getElementById(cb.getAttribute("data-jumlah"));
                    terpilih.push({
                        nama: cb.value,
                        jumlah: jumlah.value.trim(),
                        harga: Number(cb.getAttribute("data-harga")),
                        input: jumlah
                    });
                }
            });
            return terpilih;
        }

        // Konversi isi kolom jumlah menjadi angka aman (0 bila belum valid)
        function jumlahAman(inputJumlah) {
            var nilai = Number(inputJumlah.value);
            if (inputJumlah.value.trim() === "" || isNaN(nilai) || nilai < 0) {
                return 0;
            }
            return Math.floor(nilai);
        }

        // Ringkasan live: subtotal per menu, jumlah total item, dan total harga
        // dihitung ulang setiap kali centang menu / kolom jumlah berubah.
        function perbaruiRingkasanLive() {
            var terpilih = ambilPaketTerpilih();
            var totalItem = 0;
            var totalHarga = 0;

            liveDaftar.textContent = "";

            if (terpilih.length === 0) {
                var kosong = document.createElement("li");
                kosong.className = "live-kosong";
                kosong.textContent = "Belum ada menu yang dipilih.";
                liveDaftar.appendChild(kosong);
            } else {
                terpilih.forEach(function (paket) {
                    var n = jumlahAman(paket.input);
                    var subtotal = paket.harga * n;
                    totalItem += n;
                    totalHarga += subtotal;

                    var baris = document.createElement("li");
                    var teks = document.createElement("span");
                    teks.textContent = paket.nama + " × " + n;
                    var sub = document.createElement("span");
                    sub.className = "live-sub";
                    sub.textContent = formatRupiah(subtotal);
                    baris.appendChild(teks);
                    baris.appendChild(sub);
                    liveDaftar.appendChild(baris);
                });
            }

            liveItem.textContent = String(totalItem);
            liveTotal.textContent = formatRupiah(totalHarga);
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
                valid = tampilkanError(inputTelepon, "error-telepon", "Nomor HP tidak valid (9–16 angka).");
            } else {
                bersihkanError(inputTelepon, "error-telepon");
            }

            if (inputTanggal.value === "" || inputTanggal.value < hariIni) {
                valid = tampilkanError(inputTanggal, "error-tanggal", "Pilih tanggal booking hari ini atau setelahnya.");
            } else {
                bersihkanError(inputTanggal, "error-tanggal");
            }

            // Minimal satu paket dicentang, dan jumlah tiap paket harus 1–20
            var paketTerpilih = ambilPaketTerpilih();

            if (paketTerpilih.length === 0) {
                errorPaket.textContent = "Pilih minimal satu paket menu.";
                valid = false;
            } else {
                var jumlahSalah = paketTerpilih.find(function (paket) {
                    var jumlah = Number(paket.jumlah);
                    var salah = paket.jumlah === "" || isNaN(jumlah) || jumlah < 1 || jumlah > 20;
                    paket.input.classList.toggle("input-salah", salah);
                    paket.input.setAttribute("aria-invalid", salah ? "true" : "false");
                    return salah;
                });

                if (jumlahSalah) {
                    errorPaket.textContent = "Jumlah tiap paket harus antara 1 sampai 20.";
                    valid = false;
                } else {
                    errorPaket.textContent = "";
                }
            }

            // Metode pembayaran: kartu wajib 16 digit, dompet wajib memilih salah satu
            if (radioKartu.checked) {
                if (inputNoKartu.value.replace(/\s/g, "").length !== 16) {
                    valid = tampilkanError(inputNoKartu, "error-nokartu", "Nomor kartu harus tepat 16 digit (simulasi).");
                } else {
                    bersihkanError(inputNoKartu, "error-nokartu");
                }
            } else {
                bersihkanError(inputNoKartu, "error-nokartu");

                if (!formPesan.querySelector("input[name='ewallet']:checked")) {
                    errorEwallet.textContent = "Pilih salah satu dompet digital.";
                    valid = false;
                } else {
                    errorEwallet.textContent = "";
                }
            }

            return valid;
        }

        // Nomor pesanan acak, mis. "RS-9F3K" (kode waktu + 1 karakter base36)
        function buatNomorPesanan() {
            var kode = Date.now().toString(36).toUpperCase().slice(-4);
            var acak = Math.floor(Math.random() * 36).toString(36).toUpperCase();
            return "RS-" + kode + acak;
        }

        // Tambah satu baris ke <tbody> tabel ringkasan (dengan nama kolom untuk layar kecil)
        function tambahBarisRingkasan(menu, jumlah, subtotal, total) {
            var baris = ringkasanIsi.insertRow(-1);
            baris.setAttribute("role", "row");

            var selMenu = baris.insertCell(-1);
            selMenu.setAttribute("role", "cell");
            selMenu.setAttribute("data-label", "Menu");
            selMenu.textContent = menu;

            var selJumlah = baris.insertCell(-1);
            selJumlah.setAttribute("role", "cell");
            selJumlah.setAttribute("data-label", "Jumlah");
            selJumlah.textContent = jumlah;

            var selSub = baris.insertCell(-1);
            selSub.setAttribute("role", "cell");
            selSub.setAttribute("data-label", "Subtotal");
            selSub.textContent = subtotal;
            selSub.className = "sub";

            if (total) {
                baris.className = "baris-total";
            }
            return baris;
        }

        var sedangProses = false; // penjaga pengiriman ganda

        // Saat form dikirim: validasi dulu, lalu tampilkan ringkasan pesanan
        formPesan.addEventListener("submit", function (event) {
            event.preventDefault(); // cegah halaman reload

            // Cegah pengiriman berulang & pengiriman saat form tersembunyi
            if (sedangProses || formPesan.hidden) {
                return;
            }

            if (!validasiForm()) {
                // Pindahkan fokus ke isian pertama yang salah
                var fokusPertama = formPesan.querySelector(".input-salah");
                if (!fokusPertama && errorPaket.textContent) {
                    fokusPertama = formPesan.querySelector(".paket-centang");
                }
                if (!fokusPertama && errorEwallet.textContent) {
                    fokusPertama = formPesan.querySelector("input[name='ewallet']");
                }
                if (fokusPertama) {
                    fokusPertama.focus();
                }
                return; // hentikan proses jika masih ada yang salah
            }

            sedangProses = true;
            if (tombolKirim) {
                tombolKirim.disabled = true;
            }

            // Ubah tanggal YYYY-MM-DD menjadi format Indonesia: 12 Oktober 2026
            var bagianTanggal = inputTanggal.value.split("-");
            var tanggalLengkap = new Date(
                Number(bagianTanggal[0]),
                Number(bagianTanggal[1]) - 1,
                Number(bagianTanggal[2])
            ).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

            // Isi tabel ringkasan: satu baris per paket + totalnya
            var daftarPaketTerpilih = ambilPaketTerpilih();

            // buang baris lama (seluruh isi <tbody> ringkasan-isi)
            ringkasanIsi.textContent = "";

            var total = 0;
            daftarPaketTerpilih.forEach(function (paket) {
                var subtotal = paket.harga * Number(paket.jumlah);
                total += subtotal;
                tambahBarisRingkasan(paket.nama, paket.jumlah, formatRupiah(subtotal), false);
            });

            // Baris total di bawah tabel
            var totalItem = daftarPaketTerpilih.reduce(function (akumulator, paket) {
                return akumulator + Number(paket.jumlah);
            }, 0);
            tambahBarisRingkasan("Total", String(totalItem), formatRupiah(total), true);

            // Data pemesan & metode pembayaran (simulasi, tanpa transaksi nyata)
            var teksPembayaran;
            if (radioKartu.checked) {
                var digitKartu = inputNoKartu.value.replace(/\s/g, "");
                teksPembayaran = "Kartu Debit/Kredit (Visa/Mastercard) **** **** **** " + digitKartu.slice(-4);
            } else {
                var dompet = formPesan.querySelector("input[name='ewallet']:checked");
                teksPembayaran = "Dompet Digital (" + dompet.value + ")";
            }

            ringkasanSub.textContent = "Pesanan atas nama " + inputNama.value.trim()
                + " • Tanggal booking " + tanggalLengkap + " • No. HP " + inputTelepon.value.trim();
            ringkasanTotal.textContent = "Total belanja: " + formatRupiah(total);
            ringkasanInfo.textContent = "Metode pembayaran: " + teksPembayaran
                + (inputCatatan.value.trim() !== "" ? " • Catatan: " + inputCatatan.value.trim() : "")
                + ". Simpan nomor pesanan Anda: " + buatNomorPesanan()
                + ". Catatan: ini simulasi pemesanan — tidak ada transaksi pembayaran yang diproses di website; "
                + "pembayaran dilakukan saat pesanan diambil/diantar.";

            // Tampilkan ringkasan, sembunyikan form agar fokus ke hasil
            ringkasan.hidden = false;
            formPesan.hidden = true;
            ringkasan.focus();
            ringkasan.scrollIntoView({ behavior: "smooth", block: "center" });

            formPesan.reset();
            toggleDetailBayar();
            perbaruiRingkasanLive(); // ringkasan live kembali kosong

            // Bersihkan semua tanda jumlah salah setelah form direset
            formPesan.querySelectorAll(".input-salah").forEach(function (input) {
                input.classList.remove("input-salah");
                input.removeAttribute("aria-invalid");
            });
            errorPaket.textContent = "";
            errorEwallet.textContent = "";

            if (tombolKirim) {
                tombolKirim.disabled = false;
            }
            sedangProses = false;
        });

        // Tombol "Pesan Lagi" mengembalikan tampilan ke form
        ringkasanLagi.addEventListener("click", function () {
            ringkasan.hidden = true;
            formPesan.hidden = false;
        });

        // Hapus tanda error begitu pengguna mengubah isian
        inputNama.addEventListener("input", function () { bersihkanError(inputNama, "error-nama"); });
        inputTelepon.addEventListener("input", function () { bersihkanError(inputTelepon, "error-telepon"); });
        inputTanggal.addEventListener("change", function () { bersihkanError(inputTanggal, "error-tanggal"); });
        inputNoKartu.addEventListener("input", function () { bersihkanError(inputNoKartu, "error-nokartu"); });

        daftarPaket.forEach(function (cb) {
            var jumlah = document.getElementById(cb.getAttribute("data-jumlah"));

            // Nama menu menjadi label aksesibel kolom jumlah ("Jumlah Nasi Goreng ...")
            jumlah.setAttribute("aria-label", "Jumlah " + cb.value);

            cb.addEventListener("change", function () {
                errorPaket.textContent = "";
                // Jumlah ikut dibersihkan tanda salahnya bila paket dicentang ulang
                jumlah.classList.remove("input-salah");
                jumlah.removeAttribute("aria-invalid");
                perbaruiRingkasanLive();
            });

            // Mengetik jumlah otomatis ikut memilih menu tersebut
            jumlah.addEventListener("input", function () {
                // hanya angka — nilai negatif/tanda tidak pernah masuk
                jumlah.value = jumlah.value.replace(/[^\d]/g, "");

                if (!cb.checked) {
                    cb.checked = true;
                }

                errorPaket.textContent = "";

                var nilai = Number(jumlah.value);
                var salah = jumlah.value.trim() === "" || isNaN(nilai) || nilai < 1 || nilai > 20;
                jumlah.classList.toggle("input-salah", salah);
                if (salah) {
                    jumlah.setAttribute("aria-invalid", "true");
                } else {
                    jumlah.removeAttribute("aria-invalid");
                }

                perbaruiRingkasanLive();
            });

            // Saat pindah kolom, batasi jumlah ke rentang aman 1–20
            jumlah.addEventListener("change", function () {
                var nilai = Number(jumlah.value);
                if (jumlah.value.trim() === "" || isNaN(nilai) || nilai < 1) {
                    nilai = 1;
                } else if (nilai > 20) {
                    nilai = 20;
                }
                jumlah.value = String(nilai);
                jumlah.classList.remove("input-salah");
                jumlah.removeAttribute("aria-invalid");
                perbaruiRingkasanLive();
            });
        });

        // Klik area kosong/baris menu (mis. harga) ikut mencentang menu
        formPesan.querySelectorAll(".paket-item").forEach(function (item) {
            item.addEventListener("click", function (event) {
                // label & input sudah menangani sendiri; kolom jumlah tidak ikut
                if (event.target.closest("label, input, .paket-jumlah")) {
                    return;
                }
                var cb = item.querySelector(".paket-centang");
                if (!cb) {
                    return;
                }
                cb.checked = !cb.checked;
                cb.dispatchEvent(new Event("change", { bubbles: true }));
            });
        });

        daftarDompet.forEach(function (radio) {
            radio.addEventListener("change", function () { errorEwallet.textContent = ""; });
        });

        // Tampilkan ringkasan live dalam keadaan awal
        perbaruiRingkasanLive();
    }

})();
