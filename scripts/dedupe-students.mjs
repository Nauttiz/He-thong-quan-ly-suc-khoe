/**
 * Dọn dẹp học sinh trùng lặp trong Firestore.
 *
 * Học sinh được coi là TRÙNG khi giống nhau cả: tên + lớp + năm sinh + giới tính.
 * Với mỗi nhóm trùng: giữ lại 1 bản (ưu tiên bản đang được healthRecords tham chiếu
 * nhiều nhất, sau đó bản tạo sớm nhất), chuyển các healthRecords đang trỏ tới các
 * bản trùng về bản được giữ, rồi xóa các bản trùng.
 * Sau đó xóa luôn các healthRecords bị trùng hệt nhau (cùng studentId + sessionId + createdAt).
 *
 * Cách chạy (mặc định CHỈ XEM TRƯỚC, không sửa gì):
 *   node scripts/dedupe-students.mjs
 *   -> script sẽ hỏi email + mật khẩu (dùng tài khoản ADMIN)
 *
 * Khi đã xem kết quả và đồng ý, chạy thật:
 *   node scripts/dedupe-students.mjs --apply
 */
import readline from 'node:readline';
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, getDocs, doc, writeBatch
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

function ask(question, hidden = false) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  if (hidden) {
    rl._writeToOutput = function (str) {
      // Che mật khẩu bằng dấu *
      if (str.includes(question)) {
        rl.output.write(question);
      } else if (str.trim().length > 0) {
        rl.output.write('*');
      }
    };
  }
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDeVhhHzolYtWxJZy7rFXKXNxLDuZuNNqE',
  authDomain: 'student-health-tracker-vn.firebaseapp.com',
  projectId: 'student-health-tracker-vn',
};

const APPLY = process.argv.includes('--apply');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const studentKey = (s) =>
  `${String(s.name || '').trim().toLowerCase()}|${String(s.class || '').trim()}|${s.birthYear}|${s.gender}`;

async function commitInChunks(operations, label) {
  // operations: mảng các hàm (batch) => void
  const CHUNK = 450; // giới hạn 500 thao tác / batch của Firestore
  for (let i = 0; i < operations.length; i += CHUNK) {
    const batch = writeBatch(db);
    operations.slice(i, i + CHUNK).forEach(op => op(batch));
    await batch.commit();
    console.log(`   💾 ${label}: đã ghi ${Math.min(i + CHUNK, operations.length)}/${operations.length}`);
  }
}

async function main() {
  const email = process.env.FIREBASE_EMAIL || await ask('📧 Email (tài khoản ADMIN): ');
  const password = process.env.FIREBASE_PASSWORD || await ask('🔑 Mật khẩu: ', true);

  if (!email || !password) {
    console.error('❌ Thiếu email hoặc mật khẩu.');
    process.exit(1);
  }

  console.log(`🔐 Đăng nhập với ${email}...`);
  await signInWithEmailAndPassword(auth, email, password);

  console.log('📥 Đang tải dữ liệu...');
  const [studentsSnap, recordsSnap] = await Promise.all([
    getDocs(collection(db, 'students')),
    getDocs(collection(db, 'healthRecords')),
  ]);

  const students = studentsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
  const records = recordsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
  console.log(`   👥 ${students.length} học sinh, 📊 ${records.length} bản ghi sức khỏe`);

  // Đếm số record tham chiếu tới từng học sinh
  const refCount = new Map();
  for (const r of records) {
    refCount.set(r.studentId, (refCount.get(r.studentId) || 0) + 1);
  }

  // Gom nhóm học sinh trùng
  const groups = new Map();
  for (const s of students) {
    const key = studentKey(s);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }

  const remap = new Map(); // id bản trùng -> id bản giữ lại
  const toDeleteStudents = [];

  for (const [, group] of groups) {
    if (group.length < 2) continue;
    // Chọn bản giữ lại: nhiều record tham chiếu nhất, rồi tới createdAt sớm nhất
    const sorted = [...group].sort((a, b) => {
      const refDiff = (refCount.get(b.id) || 0) - (refCount.get(a.id) || 0);
      if (refDiff !== 0) return refDiff;
      return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
    });
    const keeper = sorted[0];
    for (const dupe of sorted.slice(1)) {
      remap.set(dupe.id, keeper.id);
      toDeleteStudents.push(dupe);
    }
    console.log(`🔁 "${keeper.name}" (${keeper.class}): giữ ${keeper.id}, xóa ${sorted.slice(1).map(d => d.id).join(', ')}`);
  }

  // Cập nhật record đang trỏ tới bản trùng
  const recordsToRemap = records.filter(r => remap.has(r.studentId));

  // Tìm record trùng hệt nhau (sau khi remap)
  const seen = new Set();
  const toDeleteRecords = [];
  for (const r of records) {
    const sid = remap.get(r.studentId) || r.studentId;
    const rKey = `${sid}|${r.sessionId}|${r.createdAt}`;
    if (seen.has(rKey)) {
      toDeleteRecords.push(r);
    } else {
      seen.add(rKey);
    }
  }

  console.log('');
  console.log('===== TÓM TẮT =====');
  console.log(`🗑️ Học sinh trùng sẽ xóa:        ${toDeleteStudents.length}`);
  console.log(`✏️ Bản ghi sức khỏe cần trỏ lại:  ${recordsToRemap.length}`);
  console.log(`🗑️ Bản ghi sức khỏe trùng sẽ xóa: ${toDeleteRecords.length}`);

  if (!APPLY) {
    console.log('');
    console.log('ℹ️ Đây là chế độ XEM TRƯỚC — chưa sửa gì cả.');
    console.log('   Chạy lại với --apply để thực hiện: node scripts/dedupe-students.mjs --apply');
    return;
  }

  const ops = [];
  for (const r of recordsToRemap) {
    const newId = remap.get(r.studentId);
    ops.push(batch => batch.update(doc(db, 'healthRecords', r.id), { studentId: newId }));
  }
  for (const r of toDeleteRecords) {
    ops.push(batch => batch.delete(doc(db, 'healthRecords', r.id)));
  }
  for (const s of toDeleteStudents) {
    ops.push(batch => batch.delete(doc(db, 'students', s.id)));
  }

  if (ops.length === 0) {
    console.log('✅ Không có gì cần dọn dẹp!');
    return;
  }

  await commitInChunks(ops, 'Đang áp dụng');
  console.log('✅ Hoàn tất dọn dẹp dữ liệu trùng lặp!');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Lỗi:', err.message || err);
    process.exit(1);
  });
