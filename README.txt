SMART CLASS QUICK - FIREBASE + GITHUB PAGES

QUAN TRONG
- GitHub Pages la website cong khai ve ma nguon; khong dua du lieu hoc sinh vao repository.
- Firebase Authentication + Firestore Rules bao ve du lieu. Chi tai khoan da duoc tao moi dang nhap duoc.
- Khong bat tinh nang dang ky cong khai trong ung dung.
- firebase-config.js chua Firebase web config; apiKey web khong phai mat khau. Bao ve du lieu bang Security Rules.

A. TAO FIREBASE
1. Vao https://console.firebase.google.com/ va tao project.
2. Them Web App (</>), sao chep firebaseConfig.
3. Authentication > Sign-in method > bat Email/Password.
4. Authentication > Users > Add user: tao tai khoan email/mat khau cho giao vien.
5. Firestore Database > Create database.
6. Chon Production mode.
7. Vao tab Rules, dan noi dung file firestore.rules, bam Publish.

B. CAU HINH
1. Mo firebase-config.js.
2. Thay cac chuoi PASTE_... bang gia tri tu Firebase Console > Project settings > General > Your apps > SDK setup and configuration > Config.
3. Luu file.

C. DANG LEN GITHUB PAGES
1. Tao repository GitHub, vi du smart-class-quick.
2. Upload cac file trong thu muc Smart_Class_Quick_Tin_Hoc vao root repository:
   index.html, app.js, style.css, firebase-config.js, firebase-sync.js.
   firestore.rules va README.txt co the de trong repo.
3. GitHub > repository > Settings > Pages.
4. Build and deployment: Deploy from a branch.
5. Branch: main; Folder: /(root); Save.
6. Doi GitHub tao URL https://TEN-TAI-KHOAN.github.io/TEN-REPO/

D. SU DUNG
- Mo URL Pages tren cac thiet bi, dang nhap cung mot tai khoan Firebase.
- Thay doi du lieu se tu dong dong bo qua Firestore.
- Lan dau dang nhap tren trinh duyet chua co du lieu: ung dung se tai du lieu local cua trinh duyet do len Firestore.
- Neu Firestore da co du lieu: du lieu tren cloud se duoc nap vao trinh duyet.
- Nen xuat TXT sao luu truoc khi bat dau dong bo lan dau.

E. CHUYEN DU LIEU TU PHIEN BAN CU
1. Mo phien ban cu tren may co du lieu.
2. Bam Xuat TXT de sao luu.
3. Mo ban GitHub Pages, dang nhap tai khoan Firebase.
4. Neu cloud chua co du lieu, no se nap du lieu LocalStorage hien tai len cloud.
5. Cac may khac dang nhap cung tai khoan se nhan du lieu cloud.

GHI CHU KY THUAT
- Firebase config khong chua private key.
- Khong chia se tai khoan giao vien. Tao tai khoan rieng neu can phan quyen nhieu giao vien.
- Ban hien tai dung mot tai lieu Firestore cho moi tai khoan; phu hop lop hoc quy mo nho/vua. Khi tang quy mo, nen chuyen sang collection theo hoc sinh/diem.
- Can Internet de dong bo; khi offline, ban nay van luu LocalStorage tren may do nhung se can thao tac sua de day lai khi ket noi.


F. THONG TIN TRUONG VA THONG KE (PHIEN BAN NANG CAP)
- Nhap ten truong va nam hoc o dau ung dung (vi du: 2026-2027). Thong tin tu dong luu tren thiet bi va dong bo Firebase.
- Trong muc Hoc sinh, chon khoang thoi gian: Hom nay, Tuan nay, Thang nay, Hoc ky I, Hoc ky II hoac Ca nam hoc.
- Bao cao tong hop hien thi so luot khen, nhac, vi pham, so luot diem va diem trung binh.
- Chi tiet tung hoc sinh hien thi so luot khen/nhac/vi pham, so bai diem, diem trung binh va diem cao nhat.
- Moc hoc ky mac dinh: HKI tu 01/09 den 31/12; HKII tu 01/01 den 31/05; ca nam tu 01/09 den 31/05 theo nam hoc da nhap.
- Bao cao tinh theo lop dang chon; du lieu cu duoc giu nguyen.

CAC CHUC NANG NANG CAO (PHIEN BAN MO RONG)
- Xep loai va xep hang tu dong theo khoang thoi gian dang chon.
- Cong thuc diem thi dua: diem hoc tap = diem trung binh x 6 (toi da 60); diem ne nep = gioi han 0-40 cua (30 + 2 diem moi luot khen, toi da +10 - 2 moi luot nhac - 5 moi vi pham).
- Xep loai: 90-100 Xuat sac; 80-89 Tot; 65-79 Dat; duoi 65 Can co gang. Hoc sinh chua co diem trong ky hien thi Chua du du lieu.
- Bieu do tien bo hien thi diem trung binh tung thang cua hoc sinh duoc chon, theo bo loc thoi gian.
- Xuat Excel tao 4 trang tinh: Thong tin, Xep hang, Bang diem, Ne nep. Bao cao su dung cung khoang thoi gian voi bo loc Thong ke hoc sinh.
- Can ket noi Internet lan dau de tai thu vien SheetJS tu CDN khi xuat Excel.

\nE. HO SO HOC SINH VA BAO CAO CHU NHIEM (BAN NANG CAP)\n- Trong tab Hoc sinh, chon Ho so de cap nhat ngay sinh, gioi tinh, dia chi, thong tin phu huynh, diem manh, noi dung can ho tro va ghi chu.\n- Chon Phieu de in phieu danh gia hoc sinh theo khoang thoi gian dang chon. Trinh duyet co the chon Save as PDF.\n- Nut In bao cao tong ket lop tao bang tong hop si so, diem, ne nep va xep loai cua lop.\n- Nhan xet duoc tao tu du lieu diem va ne nep da nhap; giao vien can doc lai, bo sung minh chung thuc te truoc khi su dung lam nhan xet chinh thuc.\n- Ho so duoc luu cung du lieu hoc sinh tren localStorage va Firebase Firestore theo tai khoan dang nhap.\n
\nF. QUAN LY NHIEU TRUONG VA NAM HOC\n- Chon truong va nam hoc tren dau ung dung de loc danh sach hoc sinh, diem va ne nep theo dung don vi dang chon.\n- Bam Quan ly danh sach truong va nam hoc de them truong moi, khai bao nam hoc dau tien va bo sung cac nam hoc tiep theo.\n- Moi ho so hoc sinh duoc gan schoolId va schoolYearId. Du lieu cu duoc tu dong chuyen vao truong/nam hoc da khai bao truoc khi nang cap.\n- Khi chuyen truong hoac nam hoc, ung dung chi hien thi hoc sinh thuoc truong va nam hoc do; du lieu cua cac truong/nam hoc khac van duoc giu lai.\n