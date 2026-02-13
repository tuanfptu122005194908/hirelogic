// Fake leaderboard data for demonstration
// 128 Vietnamese students with random progress

const VIETNAMESE_NAMES = [
  'Nguyễn Văn An', 'Trần Thị Bích', 'Lê Hoàng Cường', 'Phạm Minh Đức', 'Hoàng Thị Hà',
  'Vũ Đình Hùng', 'Đặng Quốc Khánh', 'Bùi Thị Lan', 'Đỗ Minh Long', 'Ngô Thị Mai',
  'Dương Văn Nam', 'Lý Thị Ngọc', 'Trương Quang Phúc', 'Phan Thị Quỳnh', 'Hồ Sĩ Rin',
  'Cao Thị Sen', 'Tạ Văn Trung', 'Đinh Thị Uyên', 'Lương Văn Vinh', 'Châu Thị Xuân',
  'Nguyễn Thành An', 'Trần Đức Bảo', 'Lê Thị Châu', 'Phạm Văn Dũng', 'Hoàng Minh Đạt',
  'Vũ Thị Giang', 'Đặng Văn Hải', 'Bùi Quốc Huy', 'Đỗ Thị Kim', 'Ngô Văn Lâm',
  'Dương Thị Mỹ', 'Lý Hoàng Nghĩa', 'Trương Thị Oanh', 'Phan Đức Phong', 'Hồ Thị Quyên',
  'Cao Văn Sơn', 'Tạ Thị Thanh', 'Đinh Quốc Tuấn', 'Lương Thị Vân', 'Châu Văn Yên',
  'Nguyễn Hoàng Bách', 'Trần Thị Cẩm', 'Lê Văn Danh', 'Phạm Thị Diệu', 'Hoàng Văn Đông',
  'Vũ Minh Gia', 'Đặng Thị Hạnh', 'Bùi Văn Hiếu', 'Đỗ Quốc Khang', 'Ngô Thị Linh',
  'Dương Văn Mạnh', 'Lý Thị Nhung', 'Trương Văn Phát', 'Phan Thị Quế', 'Hồ Đức Sang',
  'Cao Thị Tâm', 'Tạ Minh Thắng', 'Đinh Thị Uyển', 'Lương Quốc Việt', 'Châu Thị Yến',
  'Nguyễn Minh Bình', 'Trần Văn Chiến', 'Lê Thị Dung', 'Phạm Đức Em', 'Hoàng Thị Phương',
  'Vũ Văn Giang', 'Đặng Quốc Hiệp', 'Bùi Thị Hương', 'Đỗ Văn Khôi', 'Ngô Minh Lộc',
  'Dương Thị Nga', 'Lý Văn Ninh', 'Trương Thị Phượng', 'Phan Minh Quân', 'Hồ Thị Rạng',
  'Cao Đức Sỹ', 'Tạ Thị Thảo', 'Đinh Văn Tín', 'Lương Thị Uyên', 'Châu Quốc Vương',
  'Nguyễn Thị Ánh', 'Trần Minh Bảng', 'Lê Quốc Cảnh', 'Phạm Thị Duyên', 'Hoàng Đức Đạo',
  'Vũ Thị Hoa', 'Đặng Minh Hoàng', 'Bùi Văn Kiên', 'Đỗ Thị Liên', 'Ngô Văn Minh',
  'Dương Quốc Nghị', 'Lý Thị Phấn', 'Trương Đức Quý', 'Phan Thị Rung', 'Hồ Văn Sang',
  'Cao Thị Thu', 'Tạ Đức Toàn', 'Đinh Thị Vui', 'Lương Minh Xuân', 'Châu Thị Yến Nhi',
  'Nguyễn Đức Anh', 'Trần Thị Bảo Ngọc', 'Lê Minh Chánh', 'Phạm Văn Điền', 'Hoàng Thị Ế',
  'Vũ Quốc Gia', 'Đặng Thị Hồng', 'Bùi Minh Hòa', 'Đỗ Thị Kiều', 'Ngô Đức Lương',
  'Dương Thị Miều', 'Lý Quốc Nam', 'Trương Thị Pha', 'Phan Văn Quyền', 'Hồ Thị Sương',
  'Cao Minh Tài', 'Tạ Thị Trinh', 'Đinh Văn Ước', 'Lương Thị Vĩnh', 'Châu Đức Xuyên',
  'Nguyễn Thị Bích Ngọc', 'Trần Quốc Đại', 'Lê Thị Hồng Nhung', 'Phạm Minh Quang',
  'Hoàng Thị Thu Hà', 'Vũ Đức Thịnh', 'Đặng Minh Tú', 'Bùi Thị Phương Anh',
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function generateFakeLeaderboard() {
  const rand = seededRandom(42); // Fixed seed for consistent data
  
  const prefixes = ['HE19', 'HE20', 'HE21'];
  const usedStudentIds = new Set<string>();

  return VIETNAMESE_NAMES.slice(0, 128).map((name, i) => {
    const prefix = prefixes[Math.floor(rand() * prefixes.length)];
    let studentId: string;
    do {
      const num = Math.floor(rand() * 9000) + 1000;
      studentId = `${prefix}${num}`;
    } while (usedStudentIds.has(studentId));
    usedStudentIds.add(studentId);

    // Random progress: completed 5-16 out of 20
    const completedDays = Math.floor(rand() * 12) + 5; // 5 to 16
    const currentDay = Math.min(completedDays + (rand() > 0.5 ? 1 : 0), 20);
    const isActive = rand() > 0.15; // 85% active

    // Each completed day requires exactly 5 problems, current day may have partial
    const currentDayProblems = Math.floor(rand() * 5); // 0-4 problems on current incomplete day
    const problemsCompleted = completedDays * 5 + currentDayProblems;
    // Average score must be >= 6 (on 10-point scale) since that's the passing threshold
    const avgScore = Math.floor(rand() * 30) + 65; // 65-94 (well above 60 minimum)
    const totalScore = problemsCompleted * avgScore;

    // Random violations (most have 0)
    const violations = rand() > 0.85 ? Math.floor(rand() * 4) + 1 : 0;

    // Random join dates spread over last 15 days
    const daysAgo = Math.floor(rand() * 15);
    const joinDate = new Date();
    joinDate.setDate(joinDate.getDate() - daysAgo);

    return {
      user_id: `fake-${i}`,
      name,
      student_id: studentId,
      total_score: totalScore,
      problems_completed: problemsCompleted,
      avg_score: avgScore,
      current_day: currentDay,
      is_active: isActive,
      joined_at: joinDate.toISOString(),
      cheat_violations: violations,
      is_disqualified: violations >= 5,
    };
  });
}
