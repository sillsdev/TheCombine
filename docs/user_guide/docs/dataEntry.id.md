# Pemasukan Data

## Pohon Medan Makna

Telusuri atau cari medan yang diminati.

!!! tip "Tips"

    Untuk mempercepat pencarian medan, The Combine akan otomatis menyisipkan `.` di antara digit berurutan saat Anda
    mengetik. Sebagai contoh, `1234` akan otomatis menjadi `1.2.3.4`. Perilaku ini tidak terjadi jika ada karakter
    non-numerik yang dimasukkan.

## Entri Baru

### Vernakular

Kata sebagaimana ditemukan dalam bahasa vernakular, biasanya dieja secara fonetis atau dengan ortografi lokal.

### Arti Singkat

Meskipun sebuah entri dapat memiliki beberapa pengertian/arti singkat, hanya satu yang dapat ditambahkan saat entri
pertama kali dibuat.

### Catatan

Anda dapat memiliki satu catatan pada setiap entri. Anotasi apa pun untuk pengertian, arti singkat, medan makna, dan
sebagainya dari suatu entri dapat ditambahkan ke catatan entri tersebut.

### Rekaman

Anda dapat menambahkan beberapa rekaman ke satu entri (misalnya, suara laki-laki dan suara perempuan). Seperti halnya
catatan, rekaman audio dikaitkan dengan entri, bukan dengan pengertian individual.

Untuk merekam audio, tersedia tombol lingkaran merah. Untuk setiap audio yang telah direkam, tersedia tombol segitiga
hijau.

**Dengan tetikus:** Klik-dan-tahan lingkaran merah untuk merekam. Klik segitiga hijau untuk memutar audionya, atau shift
klik untuk menghapus rekamannya.

**Pada layar sentuh:** Tekan-dan-tahan lingkaran merah untuk merekam. Ketuk segitiga hijau untuk memutar audionya, atau
tekan-dan-tahan untuk memunculkan menu berisi opsi.

#### Tambahkan penutur pada rekaman audio

Klik ikon penutur di batang atas untuk melihat daftar semua penutur yang tersedia dan pilih penutur saat ini. Penutur
ini akan otomatis dikaitkan dengan setiap rekaman audio hingga Anda keluar atau memilih penutur yang berbeda.

Penutur yang terkait dengan sebuah rekaman dapat dilihat dengan mengarahkan tetikus ke atas ikon putarnya, yaitu
segitiga hijau. Untuk mengubah penutur dari sebuah rekaman, klik kanan pada segitiga hijau (atau tekan-dan-tahan pada
layar sentuh).

!!! note "Catatan"

    Audio yang diimpor tidak dapat dihapus atau ditambahkan penutur.

## Entri Baru dengan Bentuk Vernakular Duplikat {#new-entry-with-duplicate-vernacular-form}

Jika Anda mengirimkan entri baru dengan bentuk vernakular dan arti singkat yang identik dengan entri yang sudah ada,
entri tersebut akan diperbarui alih-alih membuat entri baru. Sebagai contoh, jika Anda mengirimkan [Vernakular: dedo;
Arti Singkat: finger] dalam medan 2.1.3.1 (Arm) dan sekali lagi dalam medan 2.1.3.3 (Finger, Toe), hasilnya akan berupa
satu entri untuk "dedo" dengan satu pengertian yang memiliki arti singkat "finger" dan dua medan.

The Combine memiliki fitur opsional untuk memudahkan pemasukan kata-kata yang sudah ada dalam proyek tetapi dikumpulkan
kembali dalam medan makna baru. Fitur ini dapat diaktifkan atau dinonaktifkan pada
[Pengaturan Proyek > Lengkapi otomatis](project.md#autocomplete). Ketika pengaturan diaktifkan, saat Anda mengetik
bentuk vernakular pada Pemasukan Data, muncul menu tarik-turun berisi bentuk vernakular identik/mirip yang sudah ada
sebagai entri dalam proyek. Jika Anda melihat bahwa kata yang sedang Anda ketik sudah ada dalam proyek, Anda dapat
mengklik kata tersebut di daftar saran, alih-alih harus mengetik sisa kata. Ketika pengaturan dinonaktifkan, kata
vernakular harus diketik seluruhnya; tidak ada potensi kecocokan yang sudah ada yang akan disarankan.

![Pemasukan Data bentuk vernakular duplikat](images/data-entry-dup-vern.png){.center}

Baik Anda mengetik bentuk yang cocok dengan entri yang sudah ada dalam proyek atau memilih salah satu saran yang
ditawarkan oleh The Combine, sebuah kotak akan muncul dengan opsi. (Kotak ini tidak akan muncul jika pengaturan Lengkapi
otomatis dinonaktifkan atau jika Anda mengetik bentuk vernakular yang belum ada dalam proyek.) Pada kotak sembulan
tersebut, Anda akan diperlihatkan semua entri yang sudah ada dengan bentuk vernakular tersebut dan dapat memilih apakah
akan memperbarui salah satu entri tersebut atau membuat entri baru.

![Pemasukan Data entri vernakular duplikat](images/data-entry-dup-vern-select-entry.png){.center}

Jika Anda memilih untuk membuat entri baru, kotak sembulan akan tertutup, dan Anda kemudian dapat mengetik arti singkat
untuk entri baru Anda.

!!! note "Catatan"

    Bahkan jika Anda telah memilih untuk membuat entri baru, jika arti singkat yang Anda ketik identik dengan arti singkat entri lain yang memiliki bentuk vernakular yang sama, entri baru tidak akan dibuat, melainkan entri tersebut akan diperbarui.

Jika sebaliknya Anda memilih untuk memperbarui salah satu entri yang sudah ada, akan muncul opsi tambahan untuk
memperbarui pengertian yang sudah ada pada entri yang dipilih atau untuk menambahkan pengertian baru pada entri
tersebut.
