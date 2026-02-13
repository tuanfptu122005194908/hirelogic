# 📊 PHÂN TÍCH LOGIC KIỂM SOÁT TIẾN ĐỘ THỬ THÁCH 20 NGÀY

## 🎯 TỔNG QUAN

Hệ thống thử thách 20 ngày yêu cầu người dùng hoàn thành **5 bài toán mỗi ngày** (3 Easy + 1 Medium + 1 Hard) trong **20 ngày liên tục** để nhận thưởng 500,000 VND.

---

## 📐 CẤU TRÚC DỮ LIỆU

### 1. ChallengeProgress Interface
```typescript
{
  isActive: boolean;              // Thử thách đang diễn ra?
  startDate: string | null;       // Ngày bắt đầu (YYYY-MM-DD)
  currentDay: number;             // Ngày hiện tại (1-20)
  consecutiveDays: number;         // Số ngày liên tục đã hoàn thành
  completedDays: number;          // Tổng số ngày đã hoàn thành
  dailyChallenges: DailyChallenge[]; // Danh sách thử thách từng ngày
  activityLogs: ActivityLog[];     // Log hoạt động (chống gian lận)
  lastActivityDate: string | null; // Ngày hoạt động cuối cùng
  failed: boolean;                // Đã thất bại?
  failedReason?: string;          // Lý do thất bại
}
```

### 2. DailyChallenge Interface
```typescript
{
  day: number;                     // Số ngày (1-20)
  date: string;                   // Ngày cụ thể (YYYY-MM-DD)
  completed: boolean;              // Đã hoàn thành ngày này?
  problems: {
    easy: number[];               // [3 bài Easy]
    medium: number[];             // [1 bài Medium]
    hard: number[];                // [1 bài Hard]
  };
  completedProblems: {
    easy: number[];               // Đã làm xong
    medium: number[];
    hard: number[];
  };
}
```

### 3. CHALLENGE_RULES
```typescript
{
  totalDays: 20;
  dailyRequirements: {
    easy: 3,
    medium: 1,
    hard: 1
  };
  minScoreToPass: 6;              // Điểm tối thiểu để tính là hoàn thành
  maxPastePercentage: 30;        // Tối đa 30% code được paste
  minTypingSpeed: 10;             // Tối thiểu 10 ký tự/phút
}
```

---

## 🔄 FLOW HOẠT ĐỘNG

### A. KHỞI TẠO THỬ THÁCH

**Khi user click "Bắt đầu thử thách":**

1. **startChallenge()** được gọi
   - Tạo `startDate` = hôm nay
   - `currentDay` = 1
   - `consecutiveDays` = 0
   - `completedDays` = 0
   - Tạo `dailyChallenges[0]` với 5 bài toán ngẫu nhiên
   - `lastActivityDate` = hôm nay
   - Lưu vào database (Supabase) và localStorage

2. **Generate Daily Challenge:**
   - Lấy danh sách bài toán theo difficulty
   - Random 3 Easy, 1 Medium, 1 Hard
   - **QUAN TRỌNG:** Loại bỏ các bài đã dùng ở ngày trước (tránh lặp)

---

### B. HOÀN THÀNH BÀI TOÁN

**Khi user submit bài và đạt >= 6 điểm:**

1. **markProblemCompleted()** được gọi:
   ```typescript
   - Kiểm tra: score >= CHALLENGE_RULES.minScoreToPass (6)
   - Lấy currentChallenge = dailyChallenges[currentDay - 1]
   - Thêm problemId vào completedProblems[difficulty]
   - Kiểm tra xem đã đủ 5 bài chưa:
     * easy.length >= 3?
     * medium.length >= 1?
     * hard.length >= 1?
   - Nếu đủ → đánh dấu completed = true
   - Tăng completedDays và consecutiveDays
   - Cập nhật lastActivityDate = hôm nay
   ```

2. **Lưu vào database:**
   - Update `user_progress` table
   - Insert vào `challenge_results` table (cho leaderboard)

---

### C. VALIDATION KHI LOAD PROGRESS

**Mỗi khi user mở trang, `validateAndUpdateProgress()` chạy:**

#### Bước 1: Kiểm tra trạng thái
```typescript
if (!isActive || failed) return progress; // Không validate nếu đã fail
```

#### Bước 2: Kiểm tra ngày hiện tại
```typescript
const today = new Date().toISOString().split('T')[0];
const lastActivity = progress.lastActivityDate;
const daysDiff = getDaysDifference(lastActivity, today);
```

#### Bước 3: Xử lý các trường hợp

**Case 1: Vẫn trong cùng ngày**
```typescript
if (isToday(lastActivity)) {
  return progress; // Không làm gì
}
```

**Case 2: Đã qua > 1 ngày (BỎ LỠ)**
```typescript
if (daysDiff > 1) {
  return {
    ...progress,
    isActive: false,
    failed: true,
    failedReason: `Bạn đã bỏ lỡ ${daysDiff - 1} ngày. Thử thách đã kết thúc.`
  };
}
```

**Case 3: Đã qua đúng 1 ngày (NGÀY MỚI)**
```typescript
if (daysDiff === 1) {
  // Kiểm tra ngày hôm qua đã hoàn thành chưa
  const yesterdayChallenge = dailyChallenges[currentDay - 1];
  
  if (!yesterdayChallenge.completed) {
    // CHƯA HOÀN THÀNH → FAIL
    return {
      ...progress,
      isActive: false,
      failed: true,
      failedReason: `Bạn chưa hoàn thành đủ 5 bài trong Ngày ${currentDay}.`
    };
  }
  
  // ĐÃ HOÀN THÀNH → CHUYỂN SANG NGÀY MỚI
  if (currentDay >= 20) {
    // HOÀN THÀNH THỬ THÁCH!
    return progress;
  }
  
  // Tạo thử thách mới cho ngày hôm nay
  const newDay = currentDay + 1;
  const newChallenge = generateDailyChallenge(newDay, today, usedIds);
  
  return {
    ...progress,
    currentDay: newDay,
    dailyChallenges: [...dailyChallenges, newChallenge],
    lastActivityDate: today
  };
}
```

---

## ⚠️ CÁC VẤN ĐỀ TIỀM ẨN

### 1. **VẤN ĐỀ: Timezone**
```typescript
// Hiện tại dùng: new Date().toISOString().split('T')[0]
// → Lấy theo UTC, không phải local time
```

**Ví dụ:**
- User ở VN (UTC+7): 23:00 ngày 1/1
- UTC: 16:00 ngày 1/1
- Nếu so sánh với "today" theo UTC → có thể sai

**GIẢI PHÁP:**
```typescript
// Nên dùng local date
const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
```

---

### 2. **VẤN ĐỀ: Race Condition**
```typescript
// Nếu user làm 2 bài cùng lúc (2 tabs)
// → Có thể bị duplicate hoặc mất dữ liệu
```

**GIẢI PHÁP:**
- Dùng database transaction
- Hoặc optimistic locking với version number

---

### 3. **VẤN ĐỀ: Validation chỉ chạy khi load**
```typescript
// validateAndUpdateProgress() chỉ chạy khi:
// - User mở trang
// - User đăng nhập lại
```

**VẤN ĐỀ:**
- Nếu user không mở trang trong 2 ngày → không bị fail ngay
- Chỉ fail khi user mở lại

**GIẢI PHÁP:**
- Có thể thêm scheduled job trên server để check
- Hoặc validate mỗi khi markProblemCompleted()

---

### 4. **VẤN ĐỀ: completedDays vs consecutiveDays**
```typescript
// Hiện tại:
completedDays: isComplete ? progress.completedDays + 1 : progress.completedDays
consecutiveDays: isComplete ? progress.consecutiveDays + 1 : progress.consecutiveDays
```

**VẤN ĐỀ:**
- Cả 2 đều tăng giống nhau
- Không có logic reset consecutiveDays khi bỏ lỡ

**GIẢI PHÁP:**
- `consecutiveDays` nên reset về 0 khi fail
- `completedDays` giữ nguyên (tổng số ngày đã làm)

---

### 5. **VẤN ĐỀ: lastActivityDate không chính xác**
```typescript
// Khi markProblemCompleted:
lastActivityDate: new Date().toISOString().split('T')[0]
```

**VẤN ĐỀ:**
- Cập nhật mỗi khi làm bài
- Nhưng nếu user làm bài lúc 23:59 → có thể bị tính sai ngày

**GIẢI PHÁP:**
- Dùng server timestamp
- Hoặc validate theo timezone local

---

## ✅ LOGIC ĐÚNG CẦN CÓ

### 1. **Kiểm tra ngày liên tục**
```typescript
// Mỗi ngày phải:
// - Hoàn thành trong ngày đó (không được làm trước)
// - Không được bỏ lỡ ngày nào
// - Phải đủ 5 bài với điểm >= 6
```

### 2. **Chuyển ngày tự động**
```typescript
// Khi sang ngày mới:
// 1. Check ngày hôm qua đã hoàn thành?
// 2. Nếu chưa → FAIL
// 3. Nếu rồi → Tạo thử thách mới cho hôm nay
```

### 3. **Chống gian lận**
```typescript
// - Track activity logs (typing, paste, submit)
// - Kiểm tra paste percentage
// - Kiểm tra typing speed
// - Lưu vào database để review sau
```

---

## 🔧 ĐỀ XUẤT CẢI THIỆN

### 1. **Thêm Timezone Support**
```typescript
// Tạo utility function
export const getLocalDateString = (date?: Date): string => {
  const d = date || new Date();
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
};
```

### 2. **Validate mỗi khi markProblemCompleted**
```typescript
// Thêm validation vào markProblemCompleted:
const markProblemCompleted = async (...) => {
  // ... existing code ...
  
  // Validate ngay sau khi update
  const validated = validateAndUpdateProgress(newProgress);
  if (validated.failed) {
    // Thông báo user đã fail
  }
  
  return validated;
};
```

### 3. **Fix consecutiveDays logic**
```typescript
// Khi fail, reset consecutiveDays
if (progress.failed) {
  return {
    ...progress,
    consecutiveDays: 0
  };
}

// Khi complete ngày, tăng consecutiveDays
// Khi skip ngày, reset về 0
```

### 4. **Thêm deadline cho mỗi ngày**
```typescript
// Thêm vào DailyChallenge:
{
  deadline: string; // "2024-01-02T23:59:59+07:00"
}

// Validate khi submit:
if (new Date() > new Date(challenge.deadline)) {
  // Quá hạn → không chấp nhận
}
```

### 5. **Server-side validation**
```typescript
// Tạo Supabase Edge Function hoặc cron job
// Chạy mỗi ngày lúc 00:00 để:
// - Check tất cả active challenges
// - Fail những challenge bỏ lỡ ngày
// - Advance những challenge đã hoàn thành
```

---

## 📋 CHECKLIST LOGIC CẦN KIỂM TRA

- [x] User chỉ có thể làm bài trong ngày hiện tại
- [x] Phải đủ 5 bài (3E + 1M + 1H) mỗi ngày
- [x] Mỗi bài phải đạt >= 6 điểm
- [x] Không được bỏ lỡ ngày nào
- [x] Tự động chuyển sang ngày mới khi hoàn thành
- [x] Tự động fail khi bỏ lỡ
- [ ] **CẦN FIX:** Timezone handling
- [ ] **CẦN FIX:** Validate real-time (không chỉ khi load)
- [ ] **CẦN FIX:** consecutiveDays logic
- [ ] **CẦN THÊM:** Server-side validation

---

## 🎯 KẾT LUẬN

Logic hiện tại **CƠ BẢN ĐÚNG** nhưng có một số điểm cần cải thiện:

1. ✅ **Đúng:** Validation khi load, check ngày liên tục, chuyển ngày tự động
2. ⚠️ **Cần fix:** Timezone, real-time validation, consecutiveDays
3. 💡 **Nên thêm:** Server-side validation, deadline per day, better error handling

**Ưu tiên sửa:**
1. Timezone handling (QUAN TRỌNG)
2. Validate mỗi khi markProblemCompleted
3. Fix consecutiveDays logic
