// Dữ liệu dựa trên WHO Growth Reference 2007 cho trẻ em 5-17 tuổi

interface ZScoreData {
  age: number; // tuổi (năm)
  gender: 'male' | 'female';
  L: number; // Box-Cox transformation parameter
  M: number; // Median BMI
  S: number; // Coefficient of variation
}

// Dữ liệu WHO BMI-for-age (một phần - cần đầy đủ từ 5-17 tuổi)
export const WHO_BMI_DATA: ZScoreData[] = [
  // NAM (Male) - 5-17 tuổi
  { age: 5, gender: 'male', L: -1.316, M: 15.3, S: 0.1265 },
  { age: 6, gender: 'male', L: -1.518, M: 15.3, S: 0.1301 },
  { age: 7, gender: 'male', L: -1.740, M: 15.4, S: 0.1348 },
  { age: 8, gender: 'male', L: -1.951, M: 15.6, S: 0.1405 },
  { age: 9, gender: 'male', L: -2.128, M: 15.9, S: 0.1471 },
  { age: 10, gender: 'male', L: -2.259, M: 16.4, S: 0.1544 },
  { age: 11, gender: 'male', L: -2.337, M: 17.0, S: 0.1622 },
  { age: 12, gender: 'male', L: -2.363, M: 17.8, S: 0.1701 },
  { age: 13, gender: 'male', L: -2.340, M: 18.7, S: 0.1777 }, 
  { age: 14, gender: 'male', L: -2.276, M: 19.6, S: 0.1847 },
  { age: 15, gender: 'male', L: -2.177, M: 20.4, S: 0.1909 },
  { age: 16, gender: 'male', L: -2.052, M: 21.0, S: 0.1961 },
  { age: 17, gender: 'male', L: -1.906, M: 21.6, S: 0.2003 },

  // NỮ (Female) - 5-17 tuổi
  { age: 5, gender: 'female', L: -1.245, M: 15.2, S: 0.1284 },
  { age: 6, gender: 'female', L: -1.447, M: 15.2, S: 0.1315 },
  { age: 7, gender: 'female', L: -1.668, M: 15.4, S: 0.1356 },
  { age: 8, gender: 'female', L: -1.886, M: 15.6, S: 0.1407 },
  { age: 9, gender: 'female', L: -2.084, M: 16.0, S: 0.1468 },
  { age: 10, gender: 'female', L: -2.249, M: 16.5, S: 0.1537 },
  { age: 11, gender: 'female', L: -2.372, M: 17.2, S: 0.1613 },
  { age: 12, gender: 'female', L: -2.450, M: 18.0, S: 0.1693 },
  { age: 13, gender: 'female', L: -2.483, M: 18.8, S: 0.1774 },
  { age: 14, gender: 'female', L: -2.477, M: 19.6, S: 0.1853 },
  { age: 15, gender: 'female', L: -2.438, M: 20.2, S: 0.1927 },
  { age: 16, gender: 'female', L: -2.372, M: 20.7, S: 0.1994 },
  { age: 17, gender: 'female', L: -2.284, M: 21.1, S: 0.2054 },
];

export function calculateWHOZScore(bmi: number, age: number, gender: 'male' | 'female'): number {
  // Tìm dữ liệu cho tuổi và giới tính tương ứng
  const data = WHO_BMI_DATA.find(d => d.age === Math.floor(age) && d.gender === gender);
  
  if (!data) {
    console.warn(`Không tìm thấy dữ liệu WHO cho tuổi ${age}, giới tính ${gender}`);
    return 0;
  }

  const { L, M, S } = data;

  // Công thức LMS của WHO: Z = ((BMI/M)^L - 1) / (L*S)
  if (L !== 0) {
    return ((Math.pow(bmi / M, L) - 1) / (L * S));
  } else {
    // Trường hợp đặc biệt khi L = 0
    return Math.log(bmi / M) / S;
  }
}

export function getZScoreSimpleName(zScore: number): string {
  if (zScore < -3) return '-3SD';
  if (zScore < -2) return '-2SD';
  if (zScore < -1) return '-1SD';
  if (zScore <= 1) return 'Trung bình';
  if (zScore <= 2) return '+1SD';
  if (zScore <= 3) return '+2SD';
  return '+3SD';
}