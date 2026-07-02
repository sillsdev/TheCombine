# Pembersihan Data / Tujuan

## Tinjau Entri {#review-entries}

Tabel Tinjau Entri menampilkan semua entri dalam proyek yang dipilih.

### Kolom

Kolom-kolomnya adalah: Sunting (tanpa tajuk), Vernakular, Jumlah Pengertian (#), Arti Singkat, Medan, Ucapan
(![Tajuk kolom ucapan Tinjau Entri](images/reviewEntriesColumnPronunciations.png){width=28}), Catatan, Tanda
(![Tajuk kolom tanda Tinjau Entri](images/reviewEntriesColumnFlag.png){width=16}), dan Hapus (tanpa tajuk).

![Tajuk kolom Tinjau Entri](images/reviewEntriesColumns.png)

Untuk menampilkan/menyembunyikan kolom atau menyusun ulang urutannya, klik ikon
![Ikon sunting kolom Tinjau Entri](images/reviewEntriesColumnsEdit.png){width=25} di sudut atas.

Karena sifat Pengumpulan Kata Cepat, [Pemasukan Data](dataEntry.md) pada The Combine tidak mendukung penambahan definisi
atau jenis kata. Namun, jika proyek memiliki data yang diimpor di mana definisi atau jenis kata sudah ada, kolom
tambahan akan tersedia di tabel Tinjau Entri.

#### Pengurutan dan Penyaringan

Terdapat ikon di bagian atas setiap kolom untuk
![Ikon saring kolom Tinjau Entri](images/reviewEntriesColumnFilter.png){width=20} menyaring dan
![Ikon urutkan kolom Tinjau Entri](images/reviewEntriesColumnSort.png){width=20} mengurutkan data.

Pada kolom yang isinya sebagian besar berupa teks (Vernakular, Arti Singkat, Catatan, atau Tanda), Anda dapat
mengurutkan secara alfabetis atau menyaring dengan pencarian teks. Secara bawaan, pencarian teks adalah pencocokan
kabur: tidak membedakan huruf besar/kecil dan mengizinkan satu atau dua kesalahan ketik. Jika Anda menginginkan
pencocokan teks yang tepat, gunakan tanda kutip di sekitar saringan Anda. Untuk menampilkan semua entri dengan teks
tidak kosong di kolom tersebut, ketik spasi sebagai saringan Anda.

Pada kolom Jumlah Pengertian atau kolom Ucapan, Anda dapat mengurutkan atau menyaring berdasarkan jumlah pengertian atau
rekaman yang dimiliki entri. Pada kolom Ucapan, Anda juga dapat menyaring berdasarkan nama penutur.

Pada kolom Medan, pengurutan dilakukan secara numerik berdasarkan id medan terkecil dari setiap entri. Untuk menyaring
berdasarkan medan, ketik id medan dengan atau tanpa titik. Sebagai contoh, "8111" dan "8.1.1.1" keduanya menampilkan
semua entri dengan pengertian di medan 8.1.1.1. Untuk juga menyertakan submedan, tambahkan titik akhir pada saringan
Anda. Sebagai contoh, "8111." mencakup medan "8.1.1.1", "8.1.1.1.1", dan "8.1.1.1.2". Saring hanya dengan titik (".")
untuk menampilkan semua entri dengan medan makna apa pun.

### Menyunting Baris Entri

Anda dapat merekam, memutar, atau menghapus rekaman audio entri dengan menggunakan ikon pada kolom Ucapan
(![Tajuk kolom ucapan Tinjau Entri](images/reviewEntriesColumnPronunciations.png){width=28}).

Anda dapat mengubah tanda pada entri dengan mengklik ikon
![Tajuk kolom tanda Tinjau Entri](images/reviewEntriesColumnFlag.png){width=16} pada kolom Tanda.

Untuk menyunting bagian lain dari entri, klik ikon sunting
![Ikon sunting baris Tinjau Entri](images/reviewEntriesRowEdit.png){width=20} pada kolom awal.

Anda dapat menghapus seluruh entri dengan mengklik ikon hapus
![Ikon hapus baris Tinjau Entri](images/reviewEntriesRowDelete.png){width=20} pada kolom akhir.

!!! note "Catatan"

    Jika Administrator proyek telah mengaktifkan pengaturan
    [Tinjau Entri untuk Pengumpul](project.md#harvester-review-entries), Pengumpul juga dapat menggunakan Tinjau Entri.
    Pengumpul dapat memperbarui rekaman audio dan tanda, tetapi kolom Sunting dan Hapus tidak tersedia bagi mereka.

## Gabungkan Duplikat {#merge-duplicates}

Alat ini secara otomatis menemukan kumpulan potensi entri duplikat (hingga 5 entri dalam setiap kumpulan, dan hingga 12
kumpulan pada setiap tahap). Pertama, alat ini menampilkan kumpulan kata dengan bentuk vernakular yang identik. Kemudian
menampilkan kumpulan dengan bentuk vernakular yang mirip atau arti singkat (atau definisi) yang identik.

![Gabungkan Duplikat dua entri](images/mergeTwo.png)

Setiap entri ditampilkan dalam satu kolom, dan setiap pengertian dari entri tersebut ditampilkan sebagai kartu yang
dapat Anda klik-dan-seret. Ada tiga hal dasar yang dapat Anda lakukan dengan pengertian: memindahkannya,
menggabungkannya dengan pengertian lain, atau menghapusnya.

### Memindahkan Pengertian

Ketika Anda mengklik-dan-menahan kartu pengertian, kartu tersebut akan berubah menjadi hijau. Anda dapat
menyeret-dan-menjatuhkan kartu pengertian ke tempat lain pada kolom yang sama untuk menyusun ulang pengertian dari entri
tersebut. Atau Anda dapat menyeret-dan-menjatuhkan kartu pengertian ke kolom yang berbeda untuk memindahkan pengertian
ke entri lain tersebut.

![Gabungkan Duplikat memindahkan pengertian](images/mergeMove.png)

Jika Anda ingin memecah entri dengan beberapa pengertian menjadi beberapa entri, Anda dapat menyeret salah satu kartu
pengertian ke kolom tambahan kosong di sebelah kanan.

### Menggabungkan Pengertian

Jika Anda menyeret kartu pengertian ke atas kartu pengertian lain, kartu pengertian lain tersebut juga akan berubah
menjadi hijau.

![Gabungkan Duplikat menggabungkan pengertian](images/mergeMerge.png)

Menjatuhkan kartu pengertian ke atas kartu pengertian lain (ketika keduanya berwarna hijau) akan menggabungkan
pengertian. Ini menyebabkan bilah sisi biru muncul di sebelah kanan, menampilkan pengertian mana yang sedang
digabungkan.

![Gabungkan Duplikat pengertian digabungkan](images/mergeSidebar.png)

Anda dapat menyeret-dan-menjatuhkan kartu pengertian ke atau dari bilah sisi untuk mengubah pengertian mana yang sedang
digabungkan. Atau di dalam bilah sisi, Anda dapat memindahkan pengertian yang berbeda ke posisi teratas (untuk
mempertahankan arti singkatnya).

![Gabungkan Duplikat memindahkan pengertian bilah sisi](images/mergeSidebarMove.png)

Klik pada tanda kurung siku kanan (>) untuk menutup atau membuka bilah sisi biru.

### Menghapus Pengertian

Untuk menghapus pengertian sepenuhnya, seret kartunya ke ikon tempat sampah di sudut kiri bawah. Ketika kartu pengertian
berubah menjadi merah, lepaskan.

![Gabungkan Duplikat menghapus pengertian](images/mergeDelete.png)

Jika Anda menghapus satu-satunya pengertian yang tersisa dari sebuah kolom, seluruh kolom akan menghilang, dan seluruh
entri tersebut akan dihapus ketika Anda menekan Simpan & Lanjutkan.

![Gabungkan Duplikat pengertian dihapus](images/mergeDeleted.png)

### Memberi Tanda pada Entri

Terdapat ikon tanda di sudut kanan atas setiap kolom (di sebelah kanan bentuk vernakular).

![Gabungkan Duplikat memberi tanda pada entri](images/mergeFlag.png){.center}

Anda dapat mengklik ikon tanda untuk menandai entri untuk pemeriksaan atau penyuntingan di masa mendatang. (Anda dapat
mengurutkan entri yang ditandai di [Tinjau Entri](#review-entries).) Ketika Anda memberi tanda pada entri, Anda diberi
pilihan untuk menambahkan teks pada tanda.

![Gabungkan Duplikat menambahkan atau menyunting tanda](images/mergeEditFlag.png){.center}

Baik teks diketik maupun tidak, Anda akan tahu bahwa entri telah ditandai karena ikon tanda akan berwarna merah pekat.
Jika Anda menambahkan teks, Anda dapat mengarahkan kursor ke tanda untuk melihat teks tersebut.

![Gabungkan Duplikat entri yang ditandai](images/mergeFlagged.png){.center}

Klik ikon tanda merah untuk menyunting teks atau menghapus tanda.

### Menyelesaikan Kumpulan

Ada dua tombol di bagian bawah untuk merampungkan pekerjaan pada kumpulan potensi duplikat saat ini dan melanjutkan ke
kumpulan berikutnya: "Simpan & Lanjutkan" dan "Tangguhkan".

#### Simpan & Lanjutkan

![Gabungkan Duplikat tombol Simpan & Lanjutkan](images/mergeSaveAndContinue.png)

Tombol biru "Simpan & Lanjutkan" melakukan dua hal. Pertama, tombol ini menyimpan semua perubahan yang dibuat (yaitu,
semua pengertian yang dipindahkan, digabungkan, atau dihapus), memperbarui kata-kata dalam basis data. Kedua, tombol ini
menyimpan kumpulan kata yang dihasilkan sebagai bukan duplikat.

!!! tip "Tips"

    Apakah potensi duplikat sebenarnya bukan duplikat? Cukup klik Simpan & Lanjutkan untuk memberi tahu The Combine agar tidak menampilkan kumpulan tersebut lagi.

!!! note "Catatan"

    Jika salah satu kata dalam kumpulan yang sengaja tidak digabungkan disunting (misalnya, di Tinjau Entri), kumpulan tersebut mungkin muncul lagi sebagai potensi duplikat.

!!! warning "Penting"

    Hindari beberapa pengguna menggabungkan duplikat dalam proyek yang sama pada waktu yang bersamaan. Jika pengguna yang berbeda secara bersamaan menggabungkan kumpulan duplikat yang sama, hal ini akan menyebabkan pembentukan duplikat baru (meskipun para pengguna membuat keputusan penggabungan yang sama).

#### Tangguhkan

![Gabungkan Duplikat tombol Tangguhkan](images/mergeDefer.png)

Tombol abu-abu "Tangguhkan" mengatur ulang setiap perubahan yang dibuat pada kumpulan potensi duplikat. Kumpulan yang
ditangguhkan dapat ditinjau kembali melalui Tinjau Duplikat yang Ditangguhkan.

#### Kembalikan Kumpulan

Tombol "Kembalikan Kumpulan" mengatur ulang semua perubahan yang dibuat pada kumpulan duplikat saat ini (pengertian yang
dipindahkan, digabungkan, atau dihapus) tanpa menangguhkannya. Tombol ini hanya aktif ketika ada perubahan yang telah
dibuat pada kumpulan saat ini.

### Penggabungan dengan Data yang Diimpor

#### Definisi dan Jenis Kata

Meskipun definisi dan jenis kata tidak dapat ditambahkan selama Pemasukan Data, keduanya dapat hadir pada entri yang
diimpor. Informasi ini akan muncul pada kartu pengertian Gabungkan Duplikat sebagai berikut:

- Definisi apa pun dalam bahasa analisa ditampilkan di bawah arti singkat dalam bahasa tersebut.
- Jenis kata ditunjukkan dengan segi enam berwarna di sudut kiri atas. Warnanya sesuai dengan kategori umumnya
  (misalnya, nomina atau verba). Arahkan kursor Anda ke segi enam untuk melihat kategori gramatikal spesifik (misalnya,
  nomina proper atau verba transitif).

![Gabungkan Duplikat pengertian dengan definisi dan jenis kata](images/mergeSenseDefinitionsPartOfSpeech.png){.center}

!!! note "Catatan"

    Sebuah pengertian hanya dapat memiliki satu jenis kata. Jika dua pengertian yang digabungkan memiliki jenis kata yang berbeda dalam kategori umum yang sama, jenis kata akan digabungkan, dipisahkan oleh titik koma (;). Namun, jika keduanya memiliki kategori umum yang berbeda, hanya yang pertama yang dipertahankan.

#### Entri dan Pengertian Terlindungi {#protected-entries-and-senses}

Jika entri atau pengertian yang diimpor mengandung data yang tidak didukung di The Combine (misalnya, etimologi atau
pembalikan pengertian), entri tersebut dilindungi untuk mencegah penghapusannya. Jika suatu pengertian dilindungi,
kartunya akan memiliki latar belakang kuning—kartu tersebut tidak dapat dihapus atau dijatuhkan ke (yaitu, digabungkan
ke) kartu pengertian lain. Jika seluruh entri dilindungi, kolomnya akan memiliki tajuk berwarna kuning (di mana
vernakular dan tanda berada). Ketika entri yang dilindungi hanya memiliki satu pengertian, kartu pengertian tersebut
tidak dapat dipindahkan.

## Tinjau Duplikat yang Ditangguhkan {#review-deferred-duplicates}

Ini akan membuka [Gabungkan Duplikat](#merge-duplicates) dengan semua kumpulan potensi duplikat yang sebelumnya
ditangguhkan dengan _Gabungkan Duplikat_. Ini hanya tersedia jika ada setidaknya satu kumpulan yang ditangguhkan.

## Periksa Ortografi

Alat ini hanya tersedia untuk admin proyek.

_Periksa Ortografi_ memberikan gambaran umum setiap karakter unicode yang muncul dalam bentuk vernakular dari entri
proyek. Ini memungkinkan Anda mengidentifikasi karakter mana yang umum digunakan dalam bahasa tersebut, dan
"menerimanya" sebagai bagian dari inventaris karakter bahasa tersebut. Inventaris karakter adalah bagian dari berkas
LDML untuk bahasa vernakular proyek yang disertakan ketika proyek [diekspor](project.md#export). Menerima karakter akan
menghasilkan representasi bahasa yang akurat dalam Unicode, Ethnologue, dan standar serta sumber daya bahasa lainnya.

Penggunaan lain dari _Periksa Ortografi_ adalah untuk mengidentifikasi dan mengganti karakter yang telah digunakan
secara salah dalam pengetikan bentuk vernakular kata.

Ada ubinan untuk setiap karakter unicode yang muncul dalam bentuk vernakular dari entri mana pun. Setiap ubinan
menampilkan karakter, nilai Unicode "U+"-nya, jumlah kemunculan pada bentuk vernakular entri, dan penunjukannya (bawaan:
Belum diputuskan).

![Ubinan karakter Inventaris Karakter](images/characterInventoryTiles.png)

### Mengelola Satu Karakter

Klik pada ubinan karakter untuk membuka panel untuk karakter tersebut.

!!! tip "Tips"

    Anda mungkin harus menggulung untuk melihat panel. Jika jendela Anda cukup lebar, akan ada margin kosong di
    sebelah kanan; panel akan berada di bagian atasnya. Jika jendela Anda sempit, ubinan akan mengisi hingga sisi kanan
    jendela; panel akan berada di bagian bawah, di bawah semua ubinan.

![Panel karakter Inventaris Karakter](images/characterInventoryPanel.png){.center}

Bagian tengah panel menampilkan hingga 5 contoh bentuk vernakular di mana karakter tersebut muncul, menyorot karakter
pada setiap kemunculan.

Di bagian atas panel terdapat tiga tombol untuk menentukan apakah karakter harus dimasukkan dalam inventaris karakter
bahasa vernakular: "Terima", "Belum diputuskan", dan "Tolak". Menekan salah satu tombol ini akan memperbarui penunjukan
di bagian bawah ubinan karakter. (Pembaruan pada inventaris karakter ini tidak disimpan ke proyek sampai Anda mengklik
tombol Simpan di bagian bawah halaman.)

Di bagian bawah panel terdapat alat Cari-dan-Ganti. Jika _setiap_ kemunculan karakter harus diganti dengan yang lain,
ketik karakter atau string pengganti pada kotak "Ganti dengan" dan klik tombol Terapkan.

!!! warning "Penting"

    Operasi cari-dan-ganti membuat perubahan pada entri, bukan pada inventaris karakter.
