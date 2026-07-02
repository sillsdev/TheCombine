# Proyek

Sebuah proyek diperuntukkan bagi satu bahasa vernakular.

## Membuat Proyek

Saat membuat proyek, Anda memiliki pilihan untuk memulai dengan proyek kosong atau mengimpor data leksikal yang sudah
ada.

![Buat Proyek - Tzotzil](images/projectCreateTzotzil.png){.center}

### Mengimpor Data yang Sudah Ada

Jika Anda memiliki data leksikal dalam berkas [LIFT](https://software.sil.org/lifttools) (kemungkinan diekspor dari The
Combine, [FieldWorks](https://software.sil.org/fieldworks), [WeSay](https://software.sil.org/wesay), atau
[Lexique Pro](https://software.sil.org/lexiquepro)), Anda dapat mengklik tombol Telusuri di samping "Unggah data yang
ada?" untuk mengimpor data ke dalam proyek Anda.

Jika Anda memilih untuk tidak mengimpor data saat pembuatan proyek, Anda masih dapat melakukannya kemudian (lihat
[di bawah](#import)).

### Bahasa Vernakular

_Bahasa vernakular_ adalah bahasa yang kata-katanya sedang dikumpulkan. Ini biasanya adalah bahasa atau dialek lokal,
pribumi, minoritas, autokton, warisan, atau terancam punah. Setelah proyek dibuat, bahasa vernakular tidak dapat diubah.

Jika Anda memilih berkas LIFT untuk diimpor saat pembuatan proyek, menu drop-down akan muncul yang memungkinkan Anda
memilih bahasa vernakular proyek dari semua bahasa dalam berkas LDML yang diimpor.

### Bahasa Analisa

_Bahasa analisa_ adalah bahasa utama yang menjadi tujuan terjemahan bahasa vernakular. Ini biasanya adalah bahasa
regional, nasional, resmi, atau mayoritas dari lokasi di mana bahasa vernakular digunakan. Bahasa analisa tambahan dapat
ditambahkan setelah pembuatan proyek (lihat [di bawah](#project-languages)).

Jika Anda memilih berkas LIFT untuk diimpor saat pembuatan proyek, setiap bahasa yang digunakan dalam definisi atau arti
singkat akan secara otomatis ditambahkan ke proyek sebagai bahasa analisa.

## Mengelola Proyek

Ketika proyek telah dibuat atau dipilih, proyek tersebut menjadi proyek aktif—Anda akan melihat ikon roda gigi dan/atau
nama proyek di tengah App Bar di bagian atas The Combine. Mengklik ikon roda gigi atau nama proyek akan membuka
Pengaturan Proyek untuk mengelola proyek. Pengaturan berikut tersedia bagi pengguna proyek dengan izin yang memadai.

![Pengaturan](images/projectSettings123456.png)

### Pengaturan Dasar

![Pengaturan Dasar](images/projectSettings1Basic.png)

#### Nama Proyek

Nama yang khas dan deskriptif disarankan. Nama proyek merupakan bagian dari nama berkas ketika Anda
[mengekspor](#export) proyek Anda.

#### Lengkapi otomatis {#autocomplete}

Pengaturan bawaan adalah Hidup: Ketika pengguna memasukkan bentuk vernakular dari entri baru pada Pemasukan Data,
pengaturan ini memberikan saran entri yang sudah ada yang serupa, memungkinkan pengguna untuk memilih entri yang sudah
ada dan menambahkan pengertian baru ke entri tersebut, alih-alih membuat duplikat (sebagian besar) dari sesuatu yang
telah dimasukkan sebelumnya. Lihat [Pemasukan Data](dataEntry.md#new-entry-with-duplicate-vernacular-form) untuk detail
lebih lanjut.

(Ini tidak memengaruhi saran ejaan untuk arti singkat, karena saran tersebut didasarkan pada kamus yang independen dari
data proyek yang sudah ada.)

#### Manajemen Data Terlindungi

Bagian ini memiliki dua sakelar pengaturan Mati/Hidup yang terkait dengan
[perlindungan](goals.md#protected-entries-and-senses) kata dan pengertian yang diimpor dengan data yang tidak ditangani
oleh The Combine. Kedua pengaturan tersebut mati secara bawaan.

Aktifkan "Hindari kumpulan terlindungi pada Gabungkan Duplikat" untuk membuat alat Gabungkan Duplikat hanya menampilkan
kumpulan potensi duplikat dengan setidaknya satu kata yang tidak terlindungi. Ini akan menghindari kumpulan entri matang
yang diimpor dari FieldWorks dan mendorong penggabungan entri yang dikumpulkan di The Combine.

Aktifkan "Izinkan penimpaan perlindungan data pada Gabungkan Duplikat" untuk memungkinkan pengguna proyek pada Gabungkan
Duplikat menimpa perlindungan kata dan pengertian secara manual. Jika seseorang mencoba menggabungkan atau menghapus
entri atau pengertian yang terlindungi, The Combine memperingatkan mereka tentang bidang yang akan hilang.

#### Tinjau Entri untuk Pengumpul {#harvester-review-entries}

Pengaturan Mati/Hidup ini (bawaan Mati) memungkinkan Pengumpul untuk mengakses [Tinjau Entri](goals.md#review-entries).
Ketika diaktifkan, Pengumpul akan melihat tombol Pembersihan Data pada bilah navigasi dan dapat menggunakan Tinjau Entri
untuk memperbarui rekaman audio dan tanda pada entri. Namun, Pengumpul tidak dapat menyunting atau menghapus entri dari
tabel Tinjau Entri.

#### Arsipkan Proyek

Ini hanya tersedia untuk Pemilik proyek. Mengarsipkan proyek membuatnya tidak dapat diakses oleh semua pengguna. Ini
hanya dapat dibatalkan oleh administrator situs. Silakan hubungi administrator situs jika Anda ingin proyek dihapus
sepenuhnya dari peladen.

### Bahasa Proyek {#project-languages}

![Bahasa](images/projectSettings2Langs.png)

![Bahasa Proyek - Tzotzil](images/projectLanguagesTzotzil.png){.center}

_Bahasa vernakular_ yang ditentukan saat pembuatan proyek bersifat tetap.

Mungkin terdapat beberapa _bahasa analisa_ yang terkait dengan proyek, tetapi hanya yang teratas dalam daftar yang
terkait dengan entri data baru.

!!! note "Catatan"

    Jika proyek memiliki arti singkat dalam beberapa bahasa, bahasa-bahasa tersebut harus ditambahkan di sini agar semua arti singkat muncul
    dalam [Pembersihan Data](goals.md). Klik ikon kaca pembesar untuk melihat semua kode bahasa yang ada dalam proyek.

_Bahasa medan makna_ mengontrol bahasa yang digunakan untuk menampilkan judul dan deskripsi medan makna pada
[Pemasukan Data](./dataEntry.md).

### Pengguna Proyek

![Pengguna](images/projectSettings3Users.png)

#### Pengguna Saat Ini

Di samping setiap pengguna proyek terdapat ikon dengan tiga titik vertikal. Jika Anda adalah Pemilik proyek atau
Administrator, Anda dapat mengklik ini untuk membuka menu manajemen pengguna dengan opsi berikut:

<pre>
    Keluarkan dari proyek
    Ubah peran proyek:
        Pengumpul
        Editor
        Administrator
    Jadikan Pemilik proyek
        [hanya tersedia bagi Pemilik yang memodifikasi seorang Administrator]
</pre>

Seorang _Pengumpul_ dapat melakukan [Pemasukan Data](./dataEntry.md) tetapi tidak [Pembersihan Data](./goals.md). Pada
pengaturan proyek, mereka dapat melihat bahasa proyek dan jadwal lokakarya, tetapi tidak dapat melakukan perubahan apa
pun. Namun, jika Administrator proyek mengaktifkan pengaturan [Tinjau Entri untuk Pengumpul](#harvester-review-entries),
Pengumpul juga dapat mengakses [Tinjau Entri](./goals.md#review-entries) dengan fungsi terbatas: mereka dapat
memperbarui ucapan dan tanda, tetapi tidak dapat menyunting atau menghapus entri.

Seorang _Editor_ memiliki izin untuk melakukan semua yang dapat dilakukan _Pengumpul_, serta
[Tinjau Entri](./goals.md#review-entries), [Gabungkan Duplikat](./goals.md#merge-duplicates), dan [Ekspor](#export).

Seorang _Administrator_ memiliki izin untuk melakukan semua yang dapat dilakukan _Editor_, serta memodifikasi sebagian
besar pengaturan proyek dan pengguna.

!!! warning "Penting"

    Hanya ada satu Pemilik per proyek. Jika Anda "Jadikan Pemilik proyek" untuk pengguna lain, Anda akan secara otomatis berubah dari Pemilik menjadi
    Administrator untuk proyek tersebut, dan Anda tidak akan lagi dapat mengarsipkan proyek atau menjadikan/menghapus Administrator pada pengguna lain.

#### Tambahkan Pengguna

Cari pengguna yang sudah ada (menampilkan semua pengguna dengan istilah pencarian pada nama, nama pengguna, atau alamat
email mereka), atau undang pengguna baru melalui alamat email (mereka akan secara otomatis ditambahkan ke proyek ketika
mereka membuat akun melalui undangan).

#### Kelola Penutur

Penutur berbeda dari pengguna. Seorang penutur dapat dikaitkan dengan rekaman audio kata-kata. Gunakan ikon + di bagian
bawah bagian ini untuk menambahkan penutur. Di samping setiap penutur yang ditambahkan terdapat tombol untuk menghapus,
menyunting nama, dan menambahkan persetujuan untuk penggunaan suara mereka yang direkam. Metode yang didukung untuk
menambahkan persetujuan adalah (1) merekam berkas audio atau (2) mengunggah berkas gambar.

Ketika pengguna proyek berada pada Pemasukan Data atau Tinjau Entri, ikon penutur akan tersedia di bilah atas. Pengguna
dapat mengklik tombol tersebut untuk melihat daftar semua penutur yang tersedia dan memilih penutur saat ini, penutur
ini akan secara otomatis dikaitkan dengan setiap rekaman audio yang dibuat oleh pengguna hingga mereka keluar atau
memilih penutur yang berbeda.

Penutur yang terkait dengan rekaman dapat dilihat dengan mengarahkan kursor ke ikon putarnya. Untuk mengubah penutur
suatu rekaman, klik kanan ikon putar (atau tekan dan tahan pada layar sentuh untuk memunculkan menu).

Ketika proyek diekspor dari The Combine, nama penutur (dan id) akan ditambahkan sebagai label ucapan pada berkas LIFT.
Semua berkas persetujuan untuk penutur proyek akan ditambahkan ke subfolder "consent" dari ekspor (dengan id penutur
digunakan sebagai nama berkas).

### Impor/Ekspor

![Impor/Ekspor](images/projectSettings4Port.png)

#### Impor {#import}

!!! note "Catatan"

    Saat ini, ukuran maksimum berkas LIFT yang didukung untuk impor adalah 100MB.

Ketika Anda mengimpor berkas LIFT ke dalam The Combine, ia akan mengimpor setiap entri dengan bentuk leksem atau bentuk
kutipan yang cocok dengan bahasa vernakular proyek.

Pertama kali Anda mengimpor ke dalam suatu proyek, kata-kata yang diimpor akan ditambahkan bersamaan dengan kata-kata
yang dikumpulkan di The Combine. Tidak ada penghapusan duplikat, penggabungan, atau sinkronisasi otomatis yang akan
dilakukan.

Jika Anda melakukan impor kedua, semua kata di The Combine akan secara otomatis dihapus sebelum kata-kata baru diimpor.
Jangan melakukan impor kedua kecuali Anda telah mengekspor proyek Anda dan mengimpornya ke FieldWorks. Kemudian, jika
Anda ingin melakukan lebih banyak pengumpulan kata di The Combine, Anda dapat mengekspor dari FieldWorks dan mengimpor
ke The Combine. Kata-kata sebelumnya akan dihapus untuk memungkinkan awal yang bersih dengan data terbaru dari
FieldWorks.

#### Ekspor {#export}

Setelah mengklik tombol Ekspor, Anda dapat menjelajahi bagian lain dari situs web sementara data sedang disiapkan untuk
diunduh. Ketika data telah dikumpulkan, unduhan akan dimulai secara otomatis. Nama berkas adalah id proyek.

!!! warning "Penting"

    Proyek yang telah mencapai ukuran ratusan MB mungkin memerlukan beberapa menit untuk diekspor.

!!! note "Catatan"

    Pengaturan proyek, pengguna proyek, tanda kata, dan pertanyaan medan makna kustom tidak diekspor.

#### Ekspor penutur ucapan

Ketika proyek diekspor dari The Combine dan diimpor ke FieldWorks, jika ucapan memiliki penutur yang terkait, nama
penutur akan ditambahkan sebagai label ucapan. Berkas persetujuan dapat ditemukan dalam ekspor terkompresi, tetapi tidak
akan diimpor ke FieldWorks.

### Jadwal {#schedule}

![Jadwal](images/projectSettings5Sched.png)

Ini hanya tersedia untuk disunting oleh Pemilik proyek atau Administrator, memungkinkan penetapan jadwal untuk lokakarya
Pengumpulan Kata Cepat. Klik tombol pertama untuk memilih rentang tanggal untuk lokakarya. Klik tombol tengah untuk
menambah atau menghapus tanggal tertentu. Klik tombol terakhir untuk menghapus jadwal.

![Jadwal Lokakarya](images/projectSchedule.png){.center}

### Medan Makna {#semantic-domains}

![Medan Makna](images/projectSettings6Doms.png)

Pada tab pengaturan ini, Anda dapat mengubah bahasa medan makna dan mengelola medan makna kustom.

_Bahasa medan makna_ mengontrol bahasa yang digunakan untuk menampilkan judul dan deskripsi medan makna pada
[Pemasukan Data](./dataEntry.md).

Saat ini, The Combine hanya mendukung _medan makna kustom_ yang memperluas
[medan yang telah ditetapkan](https://semdom.org/). Untuk setiap medan yang telah ditetapkan, satu submedan kustom dapat
dibuat, yang akan memiliki `.0` yang ditambahkan di akhir id medan. Sebagai contoh, medan _6.2.1.1: Growing Grain_
memiliki tiga submedan standar, untuk Padi, Gandum, dan Jagung. Jika biji-bijian lain, seperti Jelai, dominan di antara
kelompok masyarakat yang mengumpulkan kata-kata, biji-bijian tersebut dapat ditambahkan sebagai medan _6.2.1.1.0_.

![Tambahkan Medan Kustom](images/projectSettingsDomsCustomAdd.png){.center}

Untuk setiap medan kustom, Anda dapat menambahkan deskripsi dan pertanyaan untuk membantu pengumpulan kata dalam medan
tersebut.

![Sunting Medan Kustom](images/projectSettingsDomsCustomEdit.png){.center}

!!! note "Catatan"

    Medan makna kustom disertakan dalam ekspor proyek dan dapat diimpor ke FieldWorks. Namun,
    pertanyaan tidak disertakan.

Medan makna kustom akan tersedia bagi semua pengguna proyek yang melakukan Pemasukan Data.

![Lihat Medan Kustom](images/projectSettingsDomsCustomSee.png){.center}

!!! note "Catatan"

    Medan makna kustom bersifat khusus per bahasa. Jika Anda menambahkan medan kustom dalam satu bahasa lalu mengubah bahasa medan
    makna, medan tersebut tidak akan terlihat kecuali Anda kembali ke bahasanya.

## Statistik Proyek

Jika Anda adalah Pemilik proyek atau Administrator, akan ada ikon lain di samping ikon roda gigi di App Bar pada bagian
atas The Combine. Ini membuka statistik tentang kata-kata dalam proyek.

![Tombol Statistik Proyek](images/projectStatsButton.png){.center}

Dalam konteks statistik ini, _kata_ mengacu pada pasangan pengertian-medan: misalnya, entri dengan 3 pengertian,
masing-masing dengan 2 medan makna, akan dihitung sebagai 6 kata.

### Kata per Pengguna

Tabel yang mencantumkan hal berikut untuk setiap pengguna proyek: jumlah kata yang dikumpulkan, jumlah medan makna yang
berbeda, dan medan makna yang paling baru digunakan. Kata-kata yang diimpor tidak memiliki pengguna terkait dan akan
dihitung dalam baris "unknownUser".

### Kata per Medan

Tabel yang mencantumkan jumlah kata pada setiap medan makna.

### Kata per Hari

Grafik garis yang menunjukkan kata-kata yang dikumpulkan selama hari-hari yang ditentukan dalam [Jadwal](#schedule)
lokakarya.

### Kemajuan Lokakarya

Grafik garis yang menunjukkan kata-kata kumulatif yang dikumpulkan sepanjang hari-hari [Jadwal](#schedule) lokakarya,
serta proyeksi untuk sisa lokakarya.
